# TaskFlow – Full-Stack Task Management Platform

TaskFlow is a full-stack task management application that helps users organize projects and manage tasks. It provides a dashboard to create, view, update, delete, search, and sort tasks.

## Features

- **User Management:** Create and view users.
- **Project Management:** Create and view projects associated with users.
- **Task Management:** Create, view, update, and delete tasks.
- **Task Priorities:** Low, Medium, and High.
- **Task Status:** Pending, In Progress, and Completed.
- **Search:** Search tasks by title using Linear Search.
- **Sorting:** Sort tasks by priority using Bubble Sort.
- **Dashboard:** View task statistics.
- **REST API:** Backend APIs built using FastAPI.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Data Validation | Pydantic |
| API Testing | Swagger UI |
| Version Control | Git and GitHub |

## Project Structure

```text
MasaiDemoProject/
│
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── algorithms.py
│   ├── create_tables.py
│   ├── test_db_connection.py
│   └── requirement.txt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
├── topic.txt
└── README.md
```

## Prerequisites

Before running the project, install:

- Python 3.8 or later
- Git
- Visual Studio Code
- VS Code Live Server extension

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Tusharpandole/MasaiDemoProject.git
```

### 2. Navigate to the project directory

```bash
cd MasaiDemoProject
```

### 3. Create a Python virtual environment

```bash
python3 -m venv .venv
```

### 4. Activate the virtual environment

**macOS / Linux:**

```bash
source .venv/bin/activate
```

**Windows:**

```bash
.venv\Scripts\activate
```

### 5. Install backend dependencies

```bash
python -m pip install -r backend/requirement.txt
```

## Database Setup

TaskFlow uses SQLite with SQLAlchemy.

From the project root, run:

```bash
python -m backend.create_tables
```

This creates the database tables required by the application.

To test the database connection:

```bash
python -m backend.test_db_connection
```

## Running the Backend

Make sure your virtual environment is activated.

From the project root, execute:

```bash
python -m uvicorn backend.main:app --reload
```

The backend API will be available at:

```text
http://127.0.0.1:8000
```

### API Documentation

FastAPI automatically generates interactive API documentation.

Open:

```text
http://127.0.0.1:8000/docs
```

You can use Swagger UI to test API endpoints without requiring the frontend.

## Running the Frontend

1. Open the project in Visual Studio Code.
2. Open the `frontend` folder.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

The frontend will generally run at:

```text
http://127.0.0.1:5500
```

Make sure the backend is running before using the dashboard.

The backend CORS configuration allows these local frontend origins:

- `http://localhost:5500`
- `http://127.0.0.1:5500`

If Live Server uses another port, update the CORS configuration in `backend/main.py`.

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check backend status |

### User APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/users` | Create a user |
| GET | `/users` | Get all users |
| GET | `/users/{user_id}` | Get a user by ID |

### Project APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/projects` | Create a project |
| GET | `/projects` | Get all projects |
| GET | `/projects/{project_id}` | Get a project by ID |

### Task APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/tasks` | Create a task |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks?sort=priority` | Get tasks sorted by priority |
| GET | `/tasks/search?keyword=API` | Search tasks by title |
| GET | `/tasks/{task_id}` | Get a task by ID |
| PUT | `/tasks/{task_id}` | Update a task |
| DELETE | `/tasks/{task_id}` | Delete a task |

## Task Data Example

Example request body for creating a task:

```json
{
  "title": "Implement login API",
  "priority": "high",
  "status": "pending",
  "due_date": "2026-11-10",
  "project_id": 1
}
```

Make sure the referenced project already exists.

## Algorithms Implemented

### 1. Linear Search

Used to search tasks by matching a keyword against task titles.

### 2. Bubble Sort

Used to sort tasks based on priority.

Both algorithms are implemented in:

```text
backend/algorithms.py
```

## Development Workflow

1. Clone the repository.
2. Create and activate a virtual environment.
3. Install backend dependencies.
4. Initialize the database tables.
5. Start the FastAPI backend.
6. Start the frontend using Live Server.
7. Test API functionality through Swagger UI.
8. Make changes and commit them using Git.

## Contributing

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Test your changes.
5. Submit a pull request.

## Repository

GitHub: https://github.com/Tusharpandole/MasaiDemoProject

---

**TaskFlow – Organize Projects. Manage Tasks. Track Progress.**