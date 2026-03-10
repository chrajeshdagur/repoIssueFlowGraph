import "../styles/footer.css"

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>📚 Documentation</h4>
            <ul>
              <li>
                <a href="#">Getting Started</a>
              </li>
              <li>
                <a href="#">API Reference</a>
              </li>
              <li>
                <a href="#">Data Formats</a>
              </li>
              <li>
                <a href="#">Examples</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>💻 Development</h4>
            <ul>
              <li>
                <a href="#">GitHub Repository</a>
              </li>
              <li>
                <a href="#">Issue Tracker</a>
              </li>
              <li>
                <a href="#">Contributing Guide</a>
              </li>
              <li>
                <a href="#">Code of Conduct</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>🤝 Community</h4>
            <ul>
              <li>
                <a href="#">Discussions</a>
              </li>
              <li>
                <a href="#">Twitter</a>
              </li>
              <li>
                <a href="#">Discord</a>
              </li>
              <li>
                <a href="#">Support</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>⚖️ Legal</h4>
            <ul>
              <li>
                <a href="#">MIT License</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Security</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 IssueFlow. Built with ❤️ by the open-source community</p>
          <p style={{ marginTop: "12px" }}>
            <a href="#">Status</a> •<a href="#">Blog</a> •<a href="#">Changelog</a> •<a href="#">Contact</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
