
# Import Base, which holds metadata for all database models.
from backend.database import Base

# Import engine, which connects SQLAlchemy to the database.
from backend.database import engine

# Import User so SQLAlchemy registers the users table.
from backend.models import User

# Import Project so SQLAlchemy registers the projects table.
from backend.models import Project

# Import Task so SQLAlchemy registers the tasks table.
from backend.models import Task

# Create all registered tables that do not already exist.
Base.metadata.create_all(bind=engine)

# Print a success message after table creation completes.
print("TaskFlow database tables created successfully!")
