"""
Combined FastAPI server and MCP Client.

This single file creates a FastAPI server that acts as a frontend API.
When it receives a request on its `/chat` endpoint, it uses an integrated
MCP client to connect to a running FastMCP tool server, communicates with the LLM,
executes any required tool calls, and returns the final response.

Requires:
- A FastMCP tool server running separately (e.g., the complaint system from the previous step).
- Environment variables for GROQ_API_KEY.

Run this server:
   uvicorn server_with_mcp_client:app --host 0.0.0.0 --port 8080
"""
from __future__ import annotations

import os
import json
import asyncio
from contextlib import AsyncExitStack
from typing import Any, Dict, List, Optional

# --- FastAPI Imports ---
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- LangChain & MCP Imports ---
from dotenv import load_dotenv
from fastmcp.client.client import Client
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage

# --- Global Configuration ---
load_dotenv()
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:8005/mcp/")
LLM_MODEL = "llama-3.1-8b-instant"

# ==============================================================================
# SECTION 1: MCP CLIENT LOGIC (Adapted from your mcp_http_chat.py)
# ==============================================================================

# Helper functions to discover and call MCP tools
async def list_mcp_tools(url: str) -> List[Dict[str, Any]]:
    async with Client(url) as client:
        return await client.list_tools()

async def get_langchain_tools(url: str) -> List[Any]:
    from langchain_core.tools import tool as lc_tool_decorator
    mcp_tools = await list_mcp_tools(url)
    lc_tools = []
    for t in mcp_tools:
        name = t.get("name")
        description = t.get("description", "")
        # Create a dummy function with the correct name for LangChain
        # The actual call is routed through _execute_tool later
        dummy_func = lambda: None
        dummy_func.__name__ = name
        dummy_func.__doc__ = description
        lc_tools.append(lc_tool_decorator(dummy_func))
    return lc_tools

async def call_mcp_tool(url: str, name: str, params: Dict[str, Any]) -> Any:
    async with Client(url) as client:
        return await client.call(name, params)

class MCPGroqChat:
    """A reusable class to manage conversation state and tool interaction."""
    def __init__(self, url: str, llm_model: str = LLM_MODEL, temperature: float = 0):
        self.url = url
        self.llm_model = llm_model
        self.temperature = temperature
        self.lc_tools: List[Any] = []
        self.llm: Optional[ChatGroq] = None
        self.llm_with_tools: Optional[Any] = None

    async def initialize(self):
        """Discovers tools and initializes the LLM. Should be called once on startup."""
        print(f"🔌 Connecting to MCP server at {self.url} to discover tools...")
        try:
            tools_info = await list_mcp_tools(self.url)
            print("✅ MCP Tools discovered:")
            for t in tools_info:
                print(f" - {t['name']}: {t.get('description', '')}")

            self.lc_tools = await get_langchain_tools(self.url)
            self.llm = ChatGroq(model=self.llm_model, temperature=self.temperature)
            self.llm_with_tools = self.llm.bind_tools(self.lc_tools)
            print("✅ Groq LLM initialized and bound to tools.")
        except Exception as e:
            print(f"❌ Error during MCPGroqChat initialization: {e}")
            print("❌ The application might not function correctly without tools.")
            # Continue without tools if MCP server is down
            self.llm = ChatGroq(model=self.llm_model, temperature=self.temperature)

    async def _execute_tool(self, name: str, arguments: Dict[str, Any]) -> str:
        """Calls the tool via the MCP server and serializes the result."""
        result = await call_mcp_tool(self.url, name, arguments)
        if isinstance(result, (dict, list)):
            try:
                return json.dumps(result, ensure_ascii=False)
            except Exception:
                return str(result)
        return str(result)

    async def process(self, user_input: str, history: List[AIMessage | HumanMessage]) -> str:
        """Processes a single user message, handling the full tool-calling loop."""
        if self.llm is None or self.llm_with_tools is None:
             raise RuntimeError("MCPGroqChat not initialized. Cannot process messages.")

        messages: List[AIMessage | HumanMessage | ToolMessage] = history + [HumanMessage(content=user_input)]

        # 1. First LLM call to decide if a tool is needed
        ai_msg = self.llm_with_tools.invoke(messages)
        messages.append(ai_msg)

        # 2. If the model wants to call tools, execute them
        if isinstance(ai_msg, AIMessage) and getattr(ai_msg, "tool_calls", None):
            for i, tc in enumerate(ai_msg.tool_calls):
                name = tc.get("name", "")
                args = tc.get("args") or {}
                try:
                    out_text = await self._execute_tool(name, args)
                except Exception as e:
                    out_text = f"Tool '{name}' failed: {e}"
                
                messages.append(ToolMessage(content=out_text, tool_call_id=tc.get("id", f"call_{i}")))

            # 3. Second LLM call with tool results to get a final answer
            final_model = self.llm.bind_tools([], tool_choice="none")
            final_msg = final_model.invoke(messages)
            return final_msg.content if isinstance(final_msg.content, str) else str(final_msg.content)

        # No tools were called, return the initial response
        return ai_msg.content if isinstance(ai_msg.content, str) else str(ai_msg.content)

# ==============================================================================
# SECTION 2: FASTAPI SERVER APPLICATION
# ==============================================================================

# Create a global instance of our chat client
mcp_chat_client = MCPGroqChat(url=MCP_SERVER_URL)

@asyncio.on_event("startup")
async def startup_event():
    """Initializes the MCP chat client when the FastAPI app starts."""
    await mcp_chat_client.initialize()

# --- Pydantic Models for API ---
class ChatMessage(BaseModel):
    role: str = Field(description="'user' or 'assistant'")
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message/question")
    history: Optional[List[ChatMessage]] = Field(
        default_factory=list,
        description="Optional prior conversation messages for context",
    )

class ChatResponse(BaseModel):
    reply: str

# --- FastAPI App and Endpoints ---
app = FastAPI(title="Unified Agent API with MCP Client")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> dict:
    """Liveness check endpoint."""
    return {"status": "ok", "mcp_server_url": MCP_SERVER_URL}

@app.post("/chat", response_model=ChatResponse)
async def agent_chat(req: ChatRequest) -> ChatResponse:
    """
    Main chat endpoint to send a message and get a reply from the agent.
    """
    try:
        # Convert Pydantic models to LangChain messages for history
        history_messages = []
        for msg in req.history:
            if msg.role == 'user':
                history_messages.append(HumanMessage(content=msg.content))
            elif msg.role == 'assistant':
                history_messages.append(AIMessage(content=msg.content))
        
        # Process the new message using the initialized client
        reply_text = await mcp_chat_client.process(req.message, history_messages)
        
        return ChatResponse(reply=reply_text)
        
    except Exception as e:
        print(f"Error in /chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
