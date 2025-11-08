#!/bin/bash

# ==========================================================
#  RepoGraph Project Directory Setup Script
#  Description: Creates the complete folder structure for
#               RepoGraph (Backend + Frontend + Docs + Tests)
# ==========================================================

# Root project directory
PROJECT_NAME="RepoGraph"
echo "🚀 Creating project structure for $PROJECT_NAME ..."
#mkdir -p $PROJECT_NAME
#cd $PROJECT_NAME

# ----------------------------------------------------------
# Root Level Files
# ----------------------------------------------------------
echo "📁 Creating root level files..."
touch .gitignore docker-compose.yml requirements.txt
#cp README.md README.md.bak  # backup template (optional)
#echo "# $PROJECT_NAME" > README.md

# ----------------------------------------------------------
# Backend (FastAPI)
# ----------------------------------------------------------
echo "📦 Setting up backend (FastAPI)..."
mkdir -p backend/{app/{api,core,models,services,utils},tests}
touch backend/app/__init__.py
touch backend/app/main.py
touch backend/app/api/__init__.py
touch backend/app/core/__init__.py
touch backend/app/models/__init__.py
touch backend/app/services/__init__.py
touch backend/app/utils/__init__.py
touch backend/tests/test_sample.py
touch backend/requirements.txt
touch backend/Dockerfile
touch backend/.env.example

cat <<EOF > backend/app/main.py
from fastapi import FastAPI

app = FastAPI(title="RepoGraph Backend API")

@app.get("/")
def root():
    return {"message": "Welcome to RepoGraph API!"}
EOF

# ----------------------------------------------------------
# Frontend (React + D3.js)
# ----------------------------------------------------------
echo "🖥️  Setting up frontend (React + D3.js)..."
mkdir -p frontend/{public,src/{components,layouts,pages,services,utils,assets,styles}}
touch frontend/src/index.js
touch frontend/src/App.js
touch frontend/src/styles/main.css
touch frontend/package.json
touch frontend/Dockerfile

cat <<EOF > frontend/src/App.js
import React from "react";

function App() {
  return (
    <div className="App">
      <h1>RepoGraph Frontend</h1>
      <p>Visualize Issue and PR dependencies interactively!</p>
    </div>
  );
}

export default App;
EOF

# ----------------------------------------------------------
# Documentation and Assets
# ----------------------------------------------------------
echo "📘 Creating documentation and asset folders..."
mkdir -p docs/{architecture,api,ui,ai_models}
touch docs/architecture/README.md
touch docs/api/endpoints.md
touch docs/ui/design.md
touch docs/ai_models/overview.md

# ----------------------------------------------------------
# AI/ML Models
# ----------------------------------------------------------
echo "🧠 Creating AI/ML components structure..."
mkdir -p ai_models/{data,notebooks,scripts,models}
touch ai_models/data/.gitkeep
touch ai_models/notebooks/exploration.ipynb
touch ai_models/scripts/preprocess.py
touch ai_models/models/.gitkeep

# ----------------------------------------------------------
# DevOps / CI-CD / Deployment
# ----------------------------------------------------------
echo "⚙️  Setting up DevOps structure..."
mkdir -p devops/{ci-cd,kubernetes,docker}
touch devops/ci-cd/github-actions.yml
touch devops/kubernetes/deployment.yaml
touch devops/docker/Dockerfile
touch devops/docker/.dockerignore

# ----------------------------------------------------------
# Tests
# ----------------------------------------------------------
echo "🧪 Creating test directories..."
mkdir -p tests/{backend,frontend,ai_models}
touch tests/backend/test_api.py
touch tests/frontend/test_ui.js
touch tests/ai_models/test_model.py

# ----------------------------------------------------------
# Final Output
# ----------------------------------------------------------
echo ""
echo "✅ RepoGraph project structure successfully created!"
echo ""
tree -L 3 .
