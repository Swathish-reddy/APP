import sqlite3

conn = sqlite3.connect('cognivuex.db')
cursor = conn.cursor()

# Get users
print("Users:")
cursor.execute("SELECT id, email FROM users")
for row in cursor.fetchall():
    print(row)

# Get patients
print("\nPatients:")
cursor.execute("SELECT patient_id, owner_id, full_name FROM patients")
for row in cursor.fetchall():
    print(row)

conn.close()
