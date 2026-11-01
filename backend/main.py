
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.algorithms import bubble_sort_tasks, linear_search_tasks


# Create the FastAPI application.
app = FastAPI(
    title="TaskFlow API",
    description="Backend API for managing users, projects, and tasks.",
    version="1.0.0"
)


# Configure CORS so the frontend can communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# -------------------------
# HEALTH API
# -------------------------

@app.get("/health")
def health_check():
    return {"status": "healthy"}


# -------------------------
# USER APIs
# -------------------------

# Create a new user.
@app.post("/users", response_model=schemas.UserResponse, status_code=201)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    # Check whether the email is already registered.
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    # Create a database user object.
    db_user = models.User(
        name=user.name,
        email=user.email
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# Get all users.
@app.get("/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


# Get one user by ID.
@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# -------------------------
# PROJECT APIs
# -------------------------

# Create a new project.
@app.post(
    "/projects",
    response_model=schemas.ProjectResponse,
    status_code=201
)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db)
):
    # Verify that the project owner exists.
    owner = db.query(models.User).filter(
        models.User.id == project.owner_id
    ).first()

    if owner is None:
        raise HTTPException(status_code=404, detail="Owner not found")

    # Create the project object.
    db_project = models.Project(
        name=project.name,
        description=project.description,
        owner_id=project.owner_id
    )

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return db_project


# Get all projects.
@app.get("/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()


# Get one project by ID.
@app.get("/projects/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


# -------------------------
# TASK APIs
# -------------------------

# Create a task inside an existing project.
@app.post("/tasks", response_model=schemas.TaskResponse, status_code=201)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db)
):
    # Verify that the project exists.
    project = db.query(models.Project).filter(
        models.Project.id == task.project_id
    ).first()

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create the task using validated request data.
    db_task = models.Task(
        title=task.title,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        project_id=task.project_id
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task


# Search tasks by title.
# IMPORTANT: Keep this route before /tasks/{task_id}.
@app.get("/tasks/search", response_model=List[schemas.TaskResponse])
def search_tasks(
    keyword: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    # Fetch all tasks from the database.
    tasks = db.query(models.Task).all()

    # Apply our Linear Search algorithm.
    matches, comparisons = linear_search_tasks(tasks, keyword)

    return matches


# Get all tasks, optionally sorted by priority.
@app.get("/tasks", response_model=List[schemas.TaskResponse])
def get_tasks(
    sort: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    # Fetch all tasks.
    tasks = db.query(models.Task).all()

    # Sort tasks when priority sorting is requested.
    if sort == "priority":
        sorted_tasks, comparisons = bubble_sort_tasks(tasks)
        return sorted_tasks

    # Reject unsupported sorting values.
    if sort is not None:
        raise HTTPException(
            status_code=400,
            detail="Unsupported sort value. Use sort=priority."
        )

    return tasks


# Get one task by ID.
@app.get("/tasks/{task_id}", response_model=schemas.TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


# Update an existing task.
@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    updated_task: schemas.TaskCreate,
    db: Session = Depends(get_db)
):
    # Find the existing task.
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    # Verify that the new project exists.
    project = db.query(models.Project).filter(
        models.Project.id == updated_task.project_id
    ).first()

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    # Update the task fields.
    db_task.title = updated_task.title
    db_task.priority = updated_task.priority
    db_task.status = updated_task.status
    db_task.due_date = updated_task.due_date
    db_task.project_id = updated_task.project_id

    db.commit()
    db.refresh(db_task)

    return db_task


# Delete an existing task.
@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    # Find the task.
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    # Delete the task from the database.
    db.delete(db_task)
    db.commit()

    return {
        "message": "Task deleted successfully",
        "task_id": task_id
    }
