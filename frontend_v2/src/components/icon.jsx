export default function RepoIssueFlowIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="8" r="4" fill="#20c997" />
      <circle cx="10" cy="20" r="4" fill="#3b82f6" />
      <circle cx="22" cy="20" r="4" fill="#a78bfa" />

      {/* Connecting lines */}
      <line x1="16" y1="12" x2="10" y2="16" stroke="#2a3f5f" strokeWidth="2" />
      <line x1="16" y1="12" x2="22" y2="16" stroke="#2a3f5f" strokeWidth="2" />

      {/* Border circle */}
      <circle cx="16" cy="16" r="15" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}
