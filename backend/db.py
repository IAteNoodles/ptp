import sqlite3
import json
from datetime import datetime

def create_test_table():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS test (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
    return {"message": "Table 'test' created successfully"}

def create_complaints_table():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            department TEXT NOT NULL,
            description TEXT NOT NULL,
            image_path TEXT,
            timestamp TEXT NOT NULL,
            status TEXT DEFAULT 'pending'
        )
    ''')
    conn.commit()
    conn.close()
    return {"message": "Table 'complaints' created successfully"}

def populate_table():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    # Insert some sample data
    cursor.executemany('''
        INSERT INTO test (name) VALUES (?)
    ''', [('Alice',), ('Bob',), ('Charlie',)])
    conn.commit()
    conn.close()
    return {"message": "Table 'test' populated with sample data"}

def populate_complaints_table():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    sample_complaints = [
        ("Pothole on Main Road", "Roads & Infrastructure", 
         "There is a large pothole on the main road near Brigade Mall that is causing traffic issues and is dangerous for vehicles. The pothole has been there for over a month and keeps getting bigger due to monsoon rains.", 
         None, datetime.now().isoformat(), "pending"),
        ("Garbage Collection Issue", "Waste Management",
         "Garbage has not been collected from our street (MG Road area) for the past 5 days. The waste is piling up and creating unhygienic conditions.",
         None, datetime.now().isoformat(), "in-progress"),
        ("Street Light Not Working", "Electricity",
         "Street light near the bus stop on Koramangala 4th Block has been non-functional for 2 weeks. This is causing safety concerns for pedestrians at night.",
         None, datetime.now().isoformat(), "pending"),
        ("Water Logging During Rain", "Drainage",
         "The entire stretch of Indiranagar 100 feet road gets completely waterlogged during heavy rains. This has been a recurring issue for the past 3 years. The drainage system needs immediate attention and upgrades.",
         None, datetime.now().isoformat(), "resolved"),
        ("Traffic Signal Malfunction", "Traffic Management",
         "Traffic signal at the Silk Board junction has been malfunctioning intermittently, causing major traffic jams during peak hours.",
         None, datetime.now().isoformat(), "in-progress")
    ]
    
    cursor.executemany('''
        INSERT INTO complaints (title, department, description, image_path, timestamp, status) 
        VALUES (?, ?, ?, ?, ?, ?)
    ''', sample_complaints)
    conn.commit()
    conn.close()
    return {"message": "Table 'complaints' populated with sample data"}

def get_all_complaints():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, title, department, description, image_path, timestamp, status 
        FROM complaints 
        ORDER BY timestamp DESC
    ''')
    complaints = cursor.fetchall()
    conn.close()
    
    # Convert to list of dictionaries
    complaints_list = []
    for complaint in complaints:
        complaints_list.append({
            "id": complaint[0],
            "title": complaint[1],
            "department": complaint[2],
            "description": complaint[3],
            "image": complaint[4],
            "timestamp": complaint[5],
            "status": complaint[6]
        })
    
    return complaints_list

def add_complaint(title, department, description, image_path=None):
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    
    cursor.execute('''
        INSERT INTO complaints (title, department, description, image_path, timestamp, status) 
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (title, department, description, image_path, timestamp, 'pending'))
    
    complaint_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"id": complaint_id, "message": "Complaint added successfully"}
