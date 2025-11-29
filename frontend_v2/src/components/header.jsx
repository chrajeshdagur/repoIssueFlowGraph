import "../styles/header.css"

export default function Header() {
  return (
    <div className="repograph-container">
      <div className="repograph-input-section">
        <div className="input-row">
          <input type="text" className="input-field" placeholder="Enter owner/repo OR GitHub Issue/PR URL" /> 
          <button className="btn" > Load Graph </button> 
          <button className="btn secondary small" > 📌 Load Sample </button>
        </div>
        <div className="input-info">
          💡 Enter: <code>owner/repo</code> (e.g., <code>torvalds/linux</code>) or a direct issue/PR URL like <code>https://github.com/owner/repo/issues/123</code>, Public repos only (no auth needed).
        </div>
      </div>
      </div>
  )
}

