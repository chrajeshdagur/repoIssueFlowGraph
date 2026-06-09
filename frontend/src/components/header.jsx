import { useState } from "react";
import "../styles/header.css";

export default function Header({ onLoadGraph, onLoadSample }) {
  const [repoInput, setRepoInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!repoInput.trim()) return;
    onLoadGraph?.(repoInput);
  };
  
  const handleLoadSample = () => {
    setRepoInput("📌 Sample Data Loaded"); // show message
    onLoadSample?.(); // trigger sample logic
  };

  return (
    <div className="repograph-container">
      <div className="repograph-input-section">
        <div className="input-row">
          <input
            type="text"
            className="input-field"
            placeholder="Enter owner/repo OR GitHub Issue/PR URL"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          <button className="btn" onClick={handleSubmit}>
            Load Graph
          </button>

          <button
            className="btn secondary small"
            onClick={handleLoadSample}
          >
            📌 Load Sample
          </button>
        </div>

        <div className="input-info">
          💡 Enter: <code>owner/repo</code> (e.g.{" "}
          <code>torvalds/linux</code>) or a direct issue/PR URL like{" "}
          <code>https://github.com/owner/repo/issues/123</code>.
          Public repositories only.
        </div>
        {error && <div className="error-box">❌ {error}</div>}
      </div>
    </div>
  );
}