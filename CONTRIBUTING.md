# Contributing to RepoIssueFlow-Graph

Thanks for wanting to contribute! Please follow these guidelines to make the process smooth.

## Code of conduct
Be respectful and constructive. If you need to report harassment or security issues, please open an issue and mark it private for maintainers.

## Getting started
1. Fork the repo and create a branch named `feature/your-feature` or `fix/issue-123`.
2. Install backend dependencies:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Branching & commits
- Use clear commit messages. Reference issues with `#<number>` when applicable.
- Rebase or squash commits before opening a PR if appropriate.

## Pull requests
- Open a PR against `main` from a feature branch on your fork.
- Include a short description of the change, why it's needed, and any migration/upgrade notes.
- Add screenshots or short recordings for UI changes.
- Link related issues and mention reviewers.

## Tests
- Add or update tests for new logic. Run tests locally:
  ```bash
  pytest --maxfail=1 --disable-warnings -q
  ```
- For frontend changes, run `npm test` in `frontend/`.

## Style
- Follow existing project style. Keep changes minimal and focused.

## Questions
If you're unsure where to start, check the `docs/` folder or open an issue titled "Help wanted: <topic>".
