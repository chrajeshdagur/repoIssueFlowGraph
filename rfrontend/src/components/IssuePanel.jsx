export default function IssuePanel() {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-indigo-400">Issue Details</h2>
      <p className="text-sm text-gray-300">
        Click on a node in the graph to view details, dependencies, and recommendations.
      </p>
    </div>
  );
}
