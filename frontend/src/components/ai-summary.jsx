import "../styles/ai-summary.css"

export default function AISummary() {
  return (
    <section className="ai-summary-section">
      <div className="ai-summary-container">
        <div className="ai-summary-header">
          <h2>AI Analysis Summary</h2>
          <span className="ai-badge">Powered by AI</span>
        </div>

        <div className="ai-summary-content">
          <div className="ai-placeholder">
            <div className="ai-icon">✨</div>
            <h3>Graph Analysis Ready</h3>
            <p>
              Select an issue from the graph to generate an AI-powered summary of the issue flow, dependencies, and
              suggested actions.
            </p>

            <div className="ai-features">
              <div className="ai-feature">
                <span className="feature-icon">📊</span>
                <div>
                  <strong>Flow Analysis</strong>
                  <p>Automatic analysis of issue dependencies</p>
                </div>
              </div>
              <div className="ai-feature">
                <span className="feature-icon">🔗</span>
                <div>
                  <strong>Link Extraction</strong>
                  <p>Identifies related issues and PRs</p>
                </div>
              </div>
              <div className="ai-feature">
                <span className="feature-icon">💡</span>
                <div>
                  <strong>Smart Insights</strong>
                  <p>Generates actionable recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
