import { NavLink, Outlet } from "react-router-dom";

const EmployerDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-300 via-purple-500 to-pink-300">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-8">
          Employer
        </h2>

        <nav className="space-y-3">
          {[
            { name: "Overview", path: "overview" },
            { name: "Employees", path: "employees" },
            { name: "Treasury", path: "treasury" },
            { name: "Bonuses", path: "bonuses" },
            { name: "Settings", path: "settings" },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={`/employer-dashboard/${item.path}`}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-purple-100"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        <header className="bg-white border-b border-slate-200 px-10 py-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Dashboard
          </h1>
        </header>

        <main className="p-10 max-w-7xl w-full">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default EmployerDashboard;

