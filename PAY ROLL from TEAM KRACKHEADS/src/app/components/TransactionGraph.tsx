import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const monthlyData = [
  { month: 'Jan', income: 45000, expenses: 12000, balance: 33000 },
  { month: 'Feb', income: 52000, expenses: 15000, balance: 37000 },
  { month: 'Mar', income: 48000, expenses: 11000, balance: 37000 },
  { month: 'Apr', income: 61000, expenses: 18000, balance: 43000 },
  { month: 'May', income: 55000, expenses: 14000, balance: 41000 },
  { month: 'Jun', income: 67000, expenses: 16000, balance: 51000 },
  { month: 'Jul', income: 58000, expenses: 13000, balance: 45000 },
  { month: 'Aug', income: 72000, expenses: 20000, balance: 52000 },
  { month: 'Sep', income: 64000, expenses: 17000, balance: 47000 },
  { month: 'Oct', income: 69000, expenses: 19000, balance: 50000 },
  { month: 'Nov', income: 71000, expenses: 21000, balance: 50000 },
  { month: 'Dec', income: 75000, expenses: 22000, balance: 53000 },
];

export function TransactionGraph() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Monthly Transaction Overview</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={monthlyData}>
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
}
