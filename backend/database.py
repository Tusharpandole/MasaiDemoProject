from sqlalchemy import create_engine  

from sqlalchemy.orm import declarative_base , sessionmaker 
#SESSION makeer to create a database sessoion and declarative base to define orm model

DATABASE_URL  = "sqlite:///./taskflow.db" 

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread" : False} 
)

#create a session factory that will produce a new database session whenever we need one 
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine 
)

Base = declarative_base()

def get_db():
    #Create a fresh database session for the current request 
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
