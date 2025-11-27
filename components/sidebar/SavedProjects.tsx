"use client";

export default function SavedProjects() {
  const savedProjects = [
    { id: 1, name: "Q1 Campaign", date: "2024-01-15" },
    { id: 2, name: "Product Launch", date: "2024-02-20" },
    { id: 3, name: "Holiday Special", date: "2024-03-10" },
  ];

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        My saved projects
      </h3>
      <div className="space-y-1">
        {savedProjects.map((project) => (
          <button
            key={project.id}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="font-medium">{project.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {project.date}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}





