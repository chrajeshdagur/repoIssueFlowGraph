import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center bg-gray-900 p-4 shadow-lg">
      <h1 className="text-xl font-bold text-indigo-400">RepoIssueFlow-Graph</h1>
      <div className="space-x-6">
        <Link to="/" className="hover:text-indigo-400">Dashboard</Link>
        <Link to="/about" className="hover:text-indigo-400">About</Link>
        <a href="https://github.com/your-repo" target="_blank" rel="noreferrer" className="hover:text-indigo-400">GitHub</a>
      </div>
    </nav>
  );
}
