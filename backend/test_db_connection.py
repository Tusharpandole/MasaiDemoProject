import sqlite3

connection = sqlite3.connect(":memory:")

version = connection.execute("SELECT sqlite_version()").fetchone()[0] 

print("SQLLITE CONNECTION SUCCESSFUL!")

print("SQLITE version:" , version)

connection.close()