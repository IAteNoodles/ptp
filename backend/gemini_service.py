import os
import json
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

class GeminiReportGenerator:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.0-flash"
    
    def generate_civic_report(self, message: str, image_data=None):
        """
        Generate a structured civic complaint report using Gemini AI
        """
        
        prompt = f"""
        You are an AI assistant for Project Sahaya, a civic issue reporting system for Bengaluru, India.

        Based on the user's message and optional image, generate a structured civic complaint report in JSON format.

        User's message: "{message}"

        Please analyze the message and generate a report with the following structure:
        {{
            "title": "Brief descriptive title of the issue",
            "department": "Relevant government department (e.g., Roads & Infrastructure, Waste Management, Electricity, Water Supply, Drainage, Traffic Management, etc.)",
            "severity": "Low/Medium/High",
            "description": "Detailed description of the issue including location details if mentioned",
            "suggested_action": "Recommended action to resolve the issue",
            "estimated_timeline": "Estimated time to resolve (e.g., 1-2 days, 1 week, 1 month)",
            "location": "Extract or infer location from the message if available",
            "category": "Type of issue (Infrastructure, Sanitation, Safety, etc.)"
        }}

        Make sure the response is a valid JSON object. If an image is provided, incorporate visual analysis into your assessment.
        """

        try:
            # Prepare content parts
            content_parts = [types.Part(text=prompt)]
            
            # Add image if provided
            if image_data:
                content_parts.append(
                    types.Part(
                        inline_data=types.Blob(
                            mime_type="image/jpeg",
                            data=image_data
                        )
                    )
                )

            # Generate content
            response = self.client.models.generate_content(
                model=self.model,
                contents=[types.Content(role="user", parts=content_parts)],
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                )
            )
            
            # Extract and parse the response
            response_text = response.text.strip()
            
            # Try to extract JSON from the response
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_str = response_text[json_start:json_end].strip()
            else:
                # Try to find JSON object
                start_idx = response_text.find("{")
                end_idx = response_text.rfind("}") + 1
                if start_idx != -1 and end_idx != 0:
                    json_str = response_text[start_idx:end_idx]
                else:
                    json_str = response_text
            
            try:
                report_data = json.loads(json_str)
                return {
                    "success": True,
                    "report": report_data,
                    "raw_response": response_text
                }
            except json.JSONDecodeError:
                # If JSON parsing fails, return a fallback structure
                return {
                    "success": False,
                    "error": "Failed to parse JSON response",
                    "raw_response": response_text,
                    "fallback_report": self._create_fallback_report(message)
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "fallback_report": self._create_fallback_report(message)
            }
    
    def _create_fallback_report(self, message: str):
        """Create a basic fallback report when AI generation fails"""
        return {
            "title": "Civic Issue Report",
            "department": "General",
            "severity": "Medium",
            "description": message,
            "suggested_action": "Issue requires investigation by relevant department",
            "estimated_timeline": "5-7 days",
            "location": "Not specified",
            "category": "General"
        }

# Hardcoded sample report for testing (pothole example)
def get_sample_pothole_report():
    return {
        "success": True,
        "report": {
            "title": "Large Pothole Causing Traffic Hazard",
            "department": "Roads & Infrastructure", 
            "severity": "High",
            "description": "A significant pothole has formed on the main road, creating dangerous driving conditions. The pothole appears to be deep and wide enough to cause vehicle damage. Multiple vehicles have been observed swerving to avoid it, creating traffic safety concerns.",
            "suggested_action": "Immediate road repair with asphalt filling. Installation of temporary warning signs until permanent repair is completed.",
            "estimated_timeline": "2-3 days for emergency repair",
            "location": "Main road (location needs to be specified)",
            "category": "Infrastructure"
        }
    }