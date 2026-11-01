
# Import Column to define table columns and Integer/String for their data types.
from sqlalchemy import Column, Integer, String, ForeignKey

# Import relationship to connect related Python model objects.
from sqlalchemy.orm import relationship

# Import the shared SQLAlchemy Base class for all database models.
from backend.database import Base


# Define the User model, which represents the users table in the database.
class User(Base):
    # Set the actual database table name to "users".
    __tablename__ = "users"

    # Create an integer ID that uniquely identifies each user.
    id = Column(Integer, primary_key=True, index=True)

    # Store the user's name and make it mandatory, with a maximum length of 100 characters.
    name = Column(String(100), nullable=False)

    # Store a mandatory email address and prevent duplicate email addresses.
    email = Column(String(255), unique=True, nullable=False)

    # Allow Python code to access all projects owned by this user.
    projects = relationship("Project", back_populates="owner")


# Define the Project model, which represents the projects table.
class Project(Base):
    # Set the actual database table name to "projects".
    __tablename__ = "projects"

    # Create an integer ID that uniquely identifies each project.
    id = Column(Integer, primary_key=True, index=True)

    # Store the project name and make it mandatory.
    name = Column(String(150), nullable=False)

    # Store an optional description for the project.
    description = Column(String(500), nullable=True)

    # Store the ID of the user who owns this project.
    # ForeignKey links this column to the users table's id column.
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Allow Python code to access the user who owns this project.
    owner = relationship("User", back_populates="projects")

    # Allow Python code to access all tasks belonging to this project.
    tasks = relationship("Task", back_populates="project")


# Define the Task model, which represents the tasks table.
class Task(Base):
    # Set the actual database table name to "tasks".
    __tablename__ = "tasks"

    # Create an integer ID that uniquely identifies each task.
    id = Column(Integer, primary_key=True, index=True)

    # Store the task title and make it mandatory.
    title = Column(String(250), nullable=False)

    # Set the default task priority to "medium" when no priority is provided.
    priority = Column(String(20), default="medium", nullable=False)

    # Set the default task status to "pending" when no status is provided.
    status = Column(String(30), default="pending", nullable=False)

    # Store an optional due date as a string for now.
    due_date = Column(String(100), nullable=True)

    # Link each task to an existing project using its ID.
    # Notice the correct table name is "projects", not "project".
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    # Allow Python code to access the project to which this task belongs.
    project = relationship("Project", back_populates="tasks")
