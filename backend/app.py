from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from db import create_test_table, populate_table, create_complaints_table, populate_complaints_table, get_all_complaints, add_complaint
from gemini_service import GeminiReportGenerator, get_sample_pothole_report
import json
import base64
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

# Initialize Gemini service
try:
    gemini_service = GeminiReportGenerator()
    gemini_available = True
except Exception as e:
    print(f"Gemini service initialization failed: {e}")
    gemini_available = False

@app.post("/api/chat")
async def chat_endpoint(
    message: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    """
    Enhanced chat endpoint that generates structured reports using Gemini AI
    """
    try:
        image_data = None
        if image:
            # Read and encode image data
            image_content = await image.read()
            image_data = base64.b64encode(image_content).decode('utf-8')
        
        # For now, use hardcoded sample if message contains "pothole"
        if "pothole" in message.lower() or not gemini_available:
            # Use sample report for demonstration
            result = get_sample_pothole_report()
        else:
            # Use Gemini AI to generate report
            result = gemini_service.generate_civic_report(message, image_data)
        
        if result["success"]:
            report = result["report"]
            return {
                "type": "report",
                "success": True,
                "report": report,
                "message": "Report generated successfully"
            }
        else:
            # Use fallback report
            report = result.get("fallback_report", {})
            return {
                "type": "report", 
                "success": True,
                "report": report,
                "message": "Report generated using fallback method",
                "warning": result.get("error", "AI generation failed")
            }
            
    except Exception as e:
        return {
            "type": "error",
            "success": False,
            "error": str(e),
            "message": "Failed to process request"
        }

@app.get("/api/complaints")
async def get_complaints():
    """
    Get all complaints for the admin panel
    """
    try:
        complaints = get_all_complaints()
        return {"complaints": complaints, "success": True}
    except Exception as e:
        return {"error": str(e), "success": False}

@app.post("/api/complaints")
async def create_complaint(
    title: str = Form(...),
    department: str = Form(...),
    description: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    """
    Create a new complaint
    """
    try:
        image_path = None
        if image:
            # In a real app, you would save the image to a file system or cloud storage
            # For now, we'll just store the filename
            image_path = f"/api/images/{image.filename}"
        
        result = add_complaint(title, department, description, image_path)
        return {"complaint_id": result["id"], "message": result["message"], "success": True}
    except Exception as e:
        return {"error": str(e), "success": False}

@app.post("/create_table")
def create_table():
    return create_test_table()

@app.post("/populate_table")
def populate():
    return populate_table()

@app.post("/setup_complaints")
def setup_complaints():
    """
    Initialize complaints table and populate with sample data
    """
    try:
        create_result = create_complaints_table()
        populate_result = populate_complaints_table()
        return {
            "create": create_result,
            "populate": populate_result,
            "success": True
        }
    except Exception as e:
        return {"error": str(e), "success": False}

@app.get("/")
def read_root():
    return {"message": "FastAPI backend with SQLite for Namma Bengaluru"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)