import React, { useEffect, useState } from "react";
import { giveBonus, getEmployees } from "../../app/api";

export default function Bonuses() {

  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const [taxPreview, setTaxPreview] = useState(0);
  const [netPreview, setNetPreview] = useState(0);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const data = await getEmployees();
    setEmployees(data);
  }

  // 🔥 Simple preview calculation (client-side estimate)
  useEffect(() => {
    const gross = Number(amount);
    if (!gross) {
      setTaxPreview(0);
      setNetPreview(0);
      return;
    }

    // This is just preview. Real tax comes from backend.
    const estimatedTax = gross * 0.1; // temporary 10% preview
    setTaxPreview(estimatedTax);
    setNetPreview(gross - estimatedTax);

  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await giveBonus(
        Number(selectedEmployee),
        Number(amount),
        reason
      );

      alert("Bonus applied successfully!");

      setSelectedEmployee("");
      setAmount("");
      setReason("");
      setTaxPreview(0);
      setNetPreview(0);

    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">

      <h1 className="text-2xl font-bold">Give Bonus</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md space-y-4">

        {/* Employee Dropdown */}
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Employee</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        {/* Gross Amount */}
        <input
          type="number"
          placeholder="Bonus Amount (Gross)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        {/* Reason */}
        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        {/* Preview Section */}
        {amount && (
          <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
            <p>Estimated Tax: ₹{taxPreview.toFixed(2)}</p>
            <p>Estimated Net: ₹{netPreview.toFixed(2)}</p>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
        >
          Give Bonus
        </button>
      </form>

    </div>
  );
}
