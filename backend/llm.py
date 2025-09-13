from fastmcp import FastMCP


mcp = FastMCP("Hospital")

import os
from dotenv import load_dotenv

load_dotenv()

import requests

#NOT NEEDED
from typing import Any


#---------------------------
from mariadb import connect, Error

import os
from dotenv import load_dotenv

load_dotenv()

user = os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")
host = os.getenv("DB_HOST")
port = int(os.getenv("DB_PORT"))


try:
    connection = connect(user=user, password=password, host=host, database=database, port=port)
    print("Connection to MariaDB Platform successful")
except Error as e:
    print(f"Error connecting to MariaDB Platform: {e}")

#--------------------------

    
AI_URL = "http://192.168.53.197:5001/predict/"

@mcp.tool("Get_Diabetes_Score")
def get_diabetes_score(
    age: int,
    gender: str,
    hypertension: int,
    heart_disease: int,
    smoking_history: str,
    bmi: float,
    HbA1c_level: float,
    blood_glucose_level: float
) -> dict:
    """
    Get the diabetes risk score for a patient based on their data.

    Args:
        age (int): Age in years.
        gender (str): "Female", "Male", or "Other".
        hypertension (int): 0 = No, 1 = Yes.
        heart_disease (int): 0 = No, 1 = Yes.
        smoking_history (str): "never", "No Info", "current", "former", "ever", "not current".
        bmi (float): Body Mass Index.
        HbA1c_level (float): Hemoglobin A1c level (3.5-9.0).
        blood_glucose_level (float): Blood glucose level (80-300 mg/dL).

    Returns:
        dict: A dictionary with the following structure:
            - prediction (int): 0 or 1, indicating the predicted class (e.g., 0 = no diabetes, 1 = diabetes).
            - risk_probability (float): The probability of diabetes risk (between 0 and 1).
            - confidence_score (float): The model's confidence in its prediction (between 0 and 1).
            - risk_category (str): Risk level, such as "Low", "Medium", or "High".
            - input_data (dict): The input patient data used for prediction.
            - explanations (dict): Explanation details, including:
                - explanations (list): List of explanation strings or factors.
                - top_factors (list): List of most influential factors.
                - summary (str): Summary of the main factors influencing the prediction.
            - interpretation (dict): Human-readable interpretation and recommendations, including:
                - result (str): Text summary of the risk.
    """
    payload = {
        "age": age,
        "gender": gender,
        "hypertension": hypertension,
        "heart_disease": heart_disease,
        "smoking_history": smoking_history,
        "bmi": bmi,
        "HbA1c_level": HbA1c_level,
        "blood_glucose_level": blood_glucose_level
    }
    try:
        response = requests.post(AI_URL + "diabetes", json=payload, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {
            "error": str(e),
            "input_data": payload
        }



@mcp.tool("Get_Cardiovascular_Score")
def get_cardiovascular_score(
    age: int,
    gender: int,
    height: float,
    weight: float,
    ap_hi: int,
    ap_lo: int,
    cholesterol: int,
    gluc: int,
    smoke: int,
    alco: int,
    active: int
) -> dict:
    """
    Get the cardiovascular risk score for a patient based on their data.

    Args:
        age (int): Age in years.
        gender (int): 1 = Female, 2 = Male.
        height (float): Height in centimeters.
        weight (float): Weight in kilograms.
        ap_hi (int): Systolic blood pressure.
        ap_lo (int): Diastolic blood pressure.
        cholesterol (int): 1 = Normal, 2 = Above normal, 3 = Well above normal.
        gluc (int): Glucose level (1 = Normal, 2 = Above normal, 3 = Well above normal).
        smoke (int): 0 = No, 1 = Yes.
        alco (int): Alcohol consumption (0 = No, 1 = Yes).
        active (int): Physical activity (0 = No, 1 = Yes).

    Returns:
        dict: 
    """
    payload = {  "age": 50,  "gender": 2,  "height": 175,  "weight": 80,  "ap_hi": 140,  "ap_lo": 90,  "cholesterol": 2,  "gluc": 1,  "smoke": 1,  "alco": 0,  "active": 1}
    try:
        response = requests.post(AI_URL + "cardiovascular", json=payload, timeout=10)
        response.raise_for_status()
        print(response.json())
        return response.json()
    except requests.RequestException as e:
        return {
            "error": str(e),
            "input_data": payload
        }
    
#TODO
def execute_query(query: str) -> str:
    """
    Executes a SQL query on the hospital database.

    Args:
        query (str): The SQL query to execute.

    Returns:
        str: The result of the query execution.
    """
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute(query)

        # For SELECT or SHOW queries, fetch and return results
        if query.strip().upper().startswith(("SELECT", "SHOW", "DESCRIBE")):
            result = cursor.fetchall()
            return str(result)
        # For INSERT, UPDATE, DELETE, commit and return affected rows
        else:
            connection.commit()
            return f"Query executed successfully. Rows affected: {cursor.rowcount}"

    except Error as e:
        return f"Error executing query: {e}"
    finally:
        if cursor:
            cursor.close()


@mcp.tool("Get_Patient_Data")
def get_patient_data(patient_id: int) -> str:
    """
    Get the patient data for a given patient ID.
    
    Args:
        patient_id (int): The ID of the patient to retrieve data for.
    
    Returns:
        str: A dictionary containing the patient's data.
    """
    return execute_query(f"SELECT * FROM patients WHERE id = {patient_id}")

@mcp.tool("Get_Lab_Reports")
def get_lab_reports(patient_id: int) -> str:
    """
    Get all lab reports for a given patient ID.
    
    Args:
        patient_id (int): The ID of the patient to retrieve lab reports for.
    
    Returns:
        str: A list of dictionaries containing the patient's lab reports.
    """
    return execute_query(f"SELECT * FROM lab_report WHERE patient_id = {patient_id}")

@mcp.tool("Get_EMH")
def get_emh(patient_id: int) -> str:
    """
    Get the EMH record for a given patient ID.
    
    Args:
        patient_id (int): The ID of the patient to retrieve the EMH for.
    
    Returns:
        str: A dictionary containing the patient's EMH record.
    """
    return execute_query(f"SELECT * FROM EMH WHERE patient_id = {patient_id}")

@mcp.tool("Update_EMH")
def update_emh(patient_id: int, record: str) -> str:
    """
    Update the EMH record for a given patient.
    
    Args:
        patient_id (int): The ID of the patient to update the EMH for.
        record (str): The new EMH record.
    
    Returns:
        str: Confirmation of the update.
    """
    return execute_query(f"UPDATE EMH SET record = '{record}' WHERE patient_id = {patient_id}")
    

@mcp.tool("Chat_With_Med_GEMMA")
def chat_with_medgemma(
    summary: str,
    symptoms: str,
    predictions: str
) -> str:
    """
    Chat with the MedGEMMA LLM using the patient's summary, symptoms, and predictions.

    Args:
        summary (str): Patient summary. (Required)
        symptoms (str): Patient symptoms. (Required)
        predictions (str): Predictions from previous ML models. (Required)

    Returns:
        str: The response from the LLM.
    """
    from langchain_ollama.chat_models import ChatOllama

    message = (
        f"Patient summary: {summary}\n"
        f"Symptoms: {symptoms}\n"
        f"Predictions: {predictions}\n"
        "Based on the above, generate differential diagnosis report, citing the possible diagnosis as well as thoroughly explaining the reasoning that diagnosis , also cite any recommended tests. Finish the report with list of cautions like patient's allergies, medications, and any other relevant information."
    )

    model = ChatOllama(model="alibayram/medgemma:4b", temperature=0)
    response = model.invoke(message)
    return response.content


if __name__ == "__main__":
    mcp.run(
        transport="http",
        host="0.0.0.0",
        port=8005,
        log_level="debug"
    )