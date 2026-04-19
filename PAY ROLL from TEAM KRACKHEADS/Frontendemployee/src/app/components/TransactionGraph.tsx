import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ApiTransaction {
  timestamp: string;
  amount: string | number;
}

function buildMonthlyData(transactions: ApiTransaction[]) {
  const byMonth: Record<string, { income: number; expenses: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = { income: 0, expenses: 0 };
  }
  transactions.forEach((t) => {
    const d = new Date(t.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { income: 0, expenses: 0 };
    byMonth[key].income += Number(t.amount);
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([k, v]) => {
      const [y, m] = k.split('-');
      const monthLabel = monthNames[parseInt(m, 10) - 1];
      return { month: `${monthLabel} ${y}`, income: v.income, expenses: v.expenses, balance: v.income - v.expenses };
    });
}

export const TransactionGraph = React.memo(function TransactionGraph({ transactions = [] }: { transactions?: ApiTransaction[] }) {
  const data = useMemo(() => {
    const monthlyData = buildMonthlyData(transactions);
    if (monthlyData.length === 0) {
      return [{ month: 'No data', income: 0, expenses: 0, balance: 0 }];
    }
    return monthlyData;
  }, [transactions]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Monthly Transaction Overview</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: 'none', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#8b5cf6" 
            fillOpacity={1} 
            fill="url(#colorIncome)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="expenses" 
            stroke="#ec4899" 
            fillOpacity={1} 
            fill="url(#colorExpenses)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#06b6d4" 
            fillOpacity={1} 
            fill="url(#colorBalance)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
