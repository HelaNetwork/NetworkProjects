import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import { getEmployees, createEmployee } from "../../app/api";

function Employees() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState("employee");
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredEmployees = useMemo(
    () =>
      employees.filter((emp) =>
        emp.name.toLowerCase().includes(search.toLowerCase())
      ),
    [employees, search]
  );

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (!addName || !addEmail) return;
    setAddLoading(true);
    try {
      await createEmployee(addName, addEmail, addRole);
      setAddName("");
      setAddEmail("");
      setAddRole("employee");
      setShowAddModal(false);
      loadEmployees();
    } catch (err: any) {
      alert(err.message || "Failed to add employee");
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">
          Employees
        </h2>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-5 py-2 rounded-lg shadow-md hover:scale-[1.03] transition"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-3 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 backdrop-blur-md"
        />
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Add Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="text"
                placeholder="Role"
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {addLoading ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading employees...</div>
        ) : (
        <table className="w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Name
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Role
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Salary
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() =>
                  navigate(
                    `/employer-dashboard/employees/${emp.id}`
                  )
                }
                className="border-t hover:bg-slate-50 cursor-pointer transition"
              >
                <td className="p-4 font-medium text-slate-800">
                  {emp.name}
                </td>

                <td className="p-4 text-slate-600">
                  {emp.role}
                </td>

                <td className="p-4 text-slate-600">
                  —
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      emp.is_streaming
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.is_streaming ? "Active" : "Paused"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </motion.div>
  );
}

export default React.memo(Employees);
