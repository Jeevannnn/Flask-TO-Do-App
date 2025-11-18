# Flask To-Do App

A minimalist task management web application built with Flask and vanilla JavaScript, featuring a clean corporate design and RESTful API architecture.

## Features

-  Create, read, update, and delete tasks
-  Mark tasks as complete/incomplete
-  Filter tasks (All, Active, Completed)


## Tech Stack

**Backend:**
- Flask (Python web framework)
- SQLite (Database)


**Frontend:**
- Vanilla JavaScript 
- HTML5
- CSS3 (Custom styling)
- Fetch API for async operations

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/flask-todo-app.git
cd flask-todo-app
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize the database:
```bash
python database.py
```

4. Run the application:
```bash
python app.py
```

5. Open your browser and navigate to:
```
http://127.0.0.1:5000
```

## Project Structure

```
flask-todo-app/
├── app.py                  # Flask application & API endpoints
├── database.py             # Database initialization script
├── requirements.txt        # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css      # Custom CSS styling
│   └── js/
│       └── app.js         # JavaScript logic
└── templates/
    └── index.html         # HTML template
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/<id>` | Update a task |
| DELETE | `/api/tasks/<id>` | Delete a task |
| PATCH | `/api/tasks/<id>/toggle` | Toggle task completion |
