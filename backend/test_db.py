import sqlite3

connection = sqlite3.connect('message.db')
cursor = connection.cursor()
cursor.execute('SELECT * FROM message')
rows = cursor.fetchall()
connection.close()

print(f"Total records: {len(rows)}")
for row in rows:
    print(row)
