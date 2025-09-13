from fastmcp import FastMCP


mcp = FastMCP("Test")

@mcp.tool
def hello():
    """
    A simple hello world tool.

    Returns: str: A greeting message.
    """
    return "Hello, World!"