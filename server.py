from fastmcp import FastMCP


mcp = FastMCP("Hospital")

import os
from dotenv import load_dotenv

load_dotenv()

import requests

#NOT NEEDED
from typing import Any


#---------------------------
#from mariadb import connect, Error

import os
from dotenv import load_dotenv

@mcp.tool("hello")
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

if __name__ == "__main__":
    mcp.run(
        transport="streamable-http",
        host="0.0.0.0",
        port=8005,
        log_level="debug"
    )