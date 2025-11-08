# Backend structure
mkdir -p backend/routes
mkdir -p backend/services
mkdir -p backend/models
mkdir -p backend/tests

# Frontend structure
mkdir -p frontend/public
mkdir -p frontend/src/components
mkdir -p frontend/src/pages
mkdir -p frontend/src/styles

# CLI structure
mkdir -p cli

# Infrastructure structure
mkdir -p infra

# Configuration structure
mkdir -p configs

# Scripts structure
mkdir -p scripts

# Documentation structure
mkdir -p docs

# Tests structure
mkdir -p tests/e2e

# GitHub workflows structure
mkdir -p .github/workflows

# Create Backend files
touch backend/app.py
touch backend/routes/github_api.py
touch backend/routes/ai_analysis.py
touch backend/routes/graph_builder.py
touch backend/services/nlp_service.py
touch backend/services/github_service.py
touch backend/models/schemas.py
touch backend/tests/test_api.py
touch backend/requirements.txt

# Create Frontend files
touch frontend/package.json
touch frontend/public/index.html
touch frontend/src/components/GraphView.jsx
touch frontend/src/components/IssuePanel.jsx
touch frontend/src/components/Navbar.jsx
touch frontend/src/pages/Dashboard.jsx
touch frontend/src/pages/Maintenance.jsx
touch frontend/src/styles/main.css
touch frontend/src/App.jsx
touch frontend/src/index.js
touch frontend/jest.config.js

# Create CLI files
touch cli/setup_project_structure.sh
touch cli/sync_repo.sh

# Create Infrastructure files
touch infra/docker-compose.yml
touch infra/Dockerfile.backend
touch infra/Dockerfile.frontend

# Create Configuration files
touch configs/.env.example

# Create Scripts files
touch scripts/migrate_db.sh

# Create Documentation files
touch docs/architecture.md

# Create Test files
touch tests/e2e/e2e.test.js

# Create GitHub workflow files
touch .github/workflows/ci.yml

# Create root level files
touch LICENSE
touch README.md
touch .gitignore

# Make shell scripts executable
chmod +x cli/setup_project_structure.sh
chmod +x cli/sync_repo.sh
chmod +x scripts/migrate_db.sh
