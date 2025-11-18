from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('tasks.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    conn = get_db_connection()
    tasks = conn.execute("SELECT * FROM tasks ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(task) for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    task_content = data.get('task', '').strip() if data else ''
    
    if not task_content:
        return jsonify({'error': 'Task cannot be empty'}), 400
    
    conn = get_db_connection()
    cursor = conn.execute("INSERT INTO tasks (task, completed) VALUES (?, 0)", (task_content,))
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'id': task_id, 'task': task_content, 'completed': 0}), 201

@app.route('/api/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.get_json()
    conn = get_db_connection()
    task = conn.execute("SELECT * FROM tasks WHERE id=?", (id,)).fetchone()
    
    if not task:
        conn.close()
        return jsonify({'error': 'Task not found'}), 404
    
    task_content = data.get('task', task['task'])
    conn.execute("UPDATE tasks SET task=? WHERE id=?", (task_content, id))
    conn.commit()
    conn.close()
    
    return jsonify({'id': id, 'task': task_content, 'completed': task['completed']})

@app.route('/api/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    conn = get_db_connection()
    result = conn.execute("DELETE FROM tasks WHERE id=?", (id,))
    conn.commit()
    conn.close()
    
    if result.rowcount == 0:
        return jsonify({'error': 'Task not found'}), 404
    
    return jsonify({'message': 'Task deleted'})

@app.route('/api/tasks/<int:id>/toggle', methods=['PATCH'])
def toggle_task(id):
    conn = get_db_connection()
    task = conn.execute("SELECT completed FROM tasks WHERE id=?", (id,)).fetchone()
    
    if not task:
        conn.close()
        return jsonify({'error': 'Task not found'}), 404
    
    new_status = 0 if task['completed'] else 1
    conn.execute("UPDATE tasks SET completed=? WHERE id=?", (new_status, id))
    conn.commit()
    conn.close()
    
    return jsonify({'id': id, 'completed': new_status})

if __name__ == "__main__":
    app.run(debug=True)

