"""Hospital FastMCP server.

This implements the tools described in `llm.py` but improves DB handling
and provides a CLI for running the server.
"""

from __future__ import annotations

import argparse
import os
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()

from fastmcp import FastMCP


mcp = FastMCP("Traffic", instructions="Traffic MCP server exposing diagnostics and DB access tools")


@mcp.tool()
def hello(name: str | None = None) -> str:
    """Return a greeting.

    Args:
        name: optional name to include in the greeting

    Returns:
        A greeting string.
    """
    if name:
        return f"Hello, {name}!"
    return "Hello, World!"


@mcp.tool()
def add(a: float, b: float) -> dict[str, Any]:
    """Return the sum of two numbers with metadata.

    This demonstrates a tool that returns a structured result.
    """
    return {"a": a, "b": b, "sum": a + b}



if __name__ == "__main__":
    mcp.run(
        transport="http",
        host="0.0.0.0",
        port=8005,
        log_level="debug"
    )