from fastapi import FastAPI

app = FastAPI(title="RepoGraph Backend API")

@app.get("/")
def root():
    return {"message": "Welcome to RepoGraph API!"}
