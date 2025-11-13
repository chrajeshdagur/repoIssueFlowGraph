export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>Powered by RepolssueFlow-Graph v1.0</p>
    </footer>
  )
}

const styles = {
  footer: {
    backgroundColor: "#1a2332",
    borderTop: "1px solid #2a3f5f",
    padding: "20px",
    textAlign: "center",
  },
  text: {
    color: "#999",
    fontSize: "14px",
    margin: 0,
  },
}
