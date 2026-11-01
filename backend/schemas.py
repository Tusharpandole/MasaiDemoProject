
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


# Allow only these priority values.
Priority = Literal["low", "medium", "high"]

# Allow only these status values.
Status = Literal["pending", "in_progress", "completed"]


# Data required when creating a user.
class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=255)


# Data returned when reading a user.
class UserResponse(UserCreate):
    id: int

    # Allow Pydantic to read values from SQLAlchemy objects.
    model_config = {"from_attributes": True}


# Data required when creating a project.
class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: Optional[str] = Field(default=None, max_length=500)
    owner_id: int = Field(gt=0)


# Data returned when reading a project.
class ProjectResponse(ProjectCreate):
    id: int
    model_config = {"from_attributes": True}


# Data required when creating a task.
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    priority: Priority = "medium"
    status: Status = "pending"
    due_date: Optional[str] = Field(default=None, max_length=100)
    project_id: int = Field(gt=0)

    # Remove extra spaces and reject titles containing only spaces.
    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Task title cannot be blank")

        return value


# Data returned when reading a task.
class TaskResponse(TaskCreate):
    id: int
    model_config = {"from_attributes": True}


# Request schema reserved for the upcoming AI Quick-Add feature.
class QuickAddRequest(BaseModel):
    description: str = Field(min_length=1, max_length=2000)
    project_id: int = Field(gt=0)
