import sqlite3

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
