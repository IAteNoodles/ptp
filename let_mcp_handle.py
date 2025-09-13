import sqlite3
import base64
from fastmcp import FastMCP

# Initialize the FastMCP agent
mcp = FastMCP("ComplaintSystem")

DB_FILE = "complaints.db"

def initialize_database():
    """
    Initializes the SQLite database and creates the 'Complaint' table if it doesn't exist.
    """
    conn = None
    try:
        # Connect to the SQLite database (it will be created if it doesn't exist)
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        # Create the Complaint table with a BLOB type for the image
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Complaint (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_type TEXT NOT NULL,
                image BLOB,
                description TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        print(f"Database '{DB_FILE}' initialized successfully.")
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        if conn:
            conn.close()


@mcp.tool("submit_report")
def submit_report(problem_type: str, image_base64: str, description: str) -> str:
    """
    Submits a new complaint report to the database.

    Args:
        problem_type (str): The category or type of the problem (e.g., "Pothole", "Broken Streetlight").
        image_base64 (str): A base64-encoded string of the image file.
        description (str): A text description of the problem.

    Returns:
        str: A confirmation message indicating success or failure.
    """
    conn = None
    try:
        # Decode the base64 string to get the raw image bytes
        image_data = base64.b64decode(image_base64)
        
        # Connect to the SQLite database
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Insert the data into the Complaint table using a parameterized query to prevent SQL injection
        cursor.execute(
            "INSERT INTO Complaint (problem_type, image, description) VALUES (?, ?, ?)",
            (problem_type, image_data, description)
        )
        
        conn.commit()
        
        # Get the ID of the newly inserted row
        new_id = cursor.lastrowid
        
        return f"Report submitted successfully. Your complaint ID is {new_id}."

    except sqlite3.Error as e:
        return f"Failed to submit report. Database error: {e}"
    except (base64.binascii.Error, TypeError) as e:
        return f"Failed to submit report. Invalid base64 image data: {e}"
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    # Ensure the database and table are created before starting the server
    initialize_database()
    
    # Run the FastMCP agent as an HTTP server
    mcp.run(
        transport="http",
        host="0.0.0.0",
        port=8005,
        log_level="debug"
    )
