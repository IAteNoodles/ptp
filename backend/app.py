from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from db import create_test_table, populate_table
import json
from typing import Optional

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat")
async def chat_endpoint(
    message: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    """
    Chat endpoint that receives messages and optional images
    """
    response_data = {
        "response": f"Thank you for your message about Bengaluru! You said: '{message}'",
        "processed_image": False
    }
    
    if image:
        # Here you would process the image
        # For now, just acknowledge it was received
        response_data["response"] += f" I also received an image: {image.filename}"
        response_data["processed_image"] = True
    
    return response_data

@app.post("/create_table")
def create_table():
    return create_test_table()

@app.post("/populate_table")
def populate():
    return populate_table()

@app.get("/")
def read_root():
    return {"message": "FastAPI backend with SQLite for Namma Bengaluru"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)