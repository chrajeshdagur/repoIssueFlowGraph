export default function Filters() {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-indigo-400 mb-3">Filters</h3>
      <div className="flex flex-col space-y-2">
        <label>
          <input type="checkbox" className="mr-2" /> Show Issues
        </label>
        <label>
          <input type="checkbox" className="mr-2" /> Show PRs
        </label>
        <label>
          <input type="checkbox" className="mr-2" /> Show Discussions
        </label>
      </div>
    </div>
  );
}
