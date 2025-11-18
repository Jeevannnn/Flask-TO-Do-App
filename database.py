import sqlite3

conn = sqlite3.connect('tasks.db')
conn.execute("""CREATE TABLE IF NOT EXISTS tasks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0
);""")
conn.close()

print("Database created successfully with 'completed' field.")

