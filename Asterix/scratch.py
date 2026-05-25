import sqlite3

try:
    conn = sqlite3.connect('agent/crisis_agent.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scans WHERE company_name LIKE '%Simulation%'")
    conn.commit()
    print("Deleted simulation rows")
    
    # Check what is left
    cursor.execute("SELECT * FROM scans ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    if row:
        print("Latest row:", row[1], row[2])
    else:
        print("Database is now empty")
except Exception as e:
    print("Error:", e)
finally:
    if 'conn' in locals():
        conn.close()
