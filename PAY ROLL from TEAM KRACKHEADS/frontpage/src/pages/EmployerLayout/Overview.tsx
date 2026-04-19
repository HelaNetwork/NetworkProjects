import { motion } from "framer-motion";
import { Users, Wallet, Calendar } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import React, { useEffect, useState } from "react";
import { getActiveStreams, getTotalPayout, getTopEarners } from "../../app/api";

const COLORS = [
  "#3b82f6",
  "#14b8a6",
  "#10b981",
  "#f59e0b",
  "#6366f1",
];

function Overview() {
  const [activeStreams, setActiveStreams] = useState(0);
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [topEarners, setTopEarners] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [activeData, payoutData, earnersData] = await Promise.all([
        getActiveStreams(),
        getTotalPayout(),
        getTopEarners(),
      ]);
      setActiveStreams(activeData.active_streams || 0);
      setTotalPayroll(Number(payoutData.total_paid_net || 0));
      setTopEarners(
        earnersData.map((e: any) => ({
          name: e.name,
          value: Number(e.total_net || 0),
        }))
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">

        <div className="rounded-xl p-6 bg-white/70 backdrop-blur-md shadow-lg border-t-4 border-blue-500">
          <Users className="w-6 h-6 text-blue-500 mb-3" />
          <p className="text-sm text-slate-600">Active Streams</p>
          <h2 className="text-3xl font-semibold mt-2">
            {activeStreams}
          </h2>
        </div>

        <div className="rounded-xl p-6 bg-white/70 backdrop-blur-md shadow-lg border-t-4 border-emerald-500">
          <Wallet className="w-6 h-6 text-emerald-500 mb-3" />
          <p className="text-sm text-slate-600">Total Net Payout</p>
          <h2 className="text-3xl font-semibold mt-2">
            ₹ {totalPayroll.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-xl p-6 bg-white/70 backdrop-blur-md shadow-lg border-t-4 border-orange-500">
          <Calendar className="w-6 h-6 text-orange-500 mb-3" />
          <p className="text-sm text-slate-600">Next Payroll Date</p>
          <h2 className="text-3xl font-semibold mt-2">
            30 March 2026
          </h2>
        </div>

      </div>

      {/* Top Earners Pie Chart */}
      <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-8">
        <h3 className="text-lg font-semibold mb-6">
          Top Earners
        </h3>

        {topEarners.length === 0 ? (
          <p className="text-slate-500">No payout data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topEarners}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                innerRadius={60}
              >
                {topEarners.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

export default React.memo(Overview);
