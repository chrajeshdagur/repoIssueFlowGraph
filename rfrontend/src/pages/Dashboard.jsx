import { useState, useEffect } from "react";
import GraphView from "../components/GraphView";
import IssuePanel from "../components/IssuePanel";
import Filters from "../components/Filters";

export default function Dashboard() {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    // mock data for demo
    setGraphData({
      nodes: [
        { id: "1", name: "Issue #1", color: "#22c55e" },
        { id: "2", name: "PR #2", color: "#3b82f6" },
        { id: "3", name: "Discussion #3", color: "#a855f7" },
      ],
      links: [
        { source: "1", target: "2" },
        { source: "2", target: "3" },
      ],
    });
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-6 p-6">
      <div className="md:col-span-2">
        <GraphView data={graphData} />
      </div>
      <div className="space-y-4">
        <Filters />
        <IssuePanel />
      </div>
    </div>
  );
}
