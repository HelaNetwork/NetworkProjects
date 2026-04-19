import { ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  category: string;
}

const transactions: Transaction[] = [
  { id: '1', date: '2026-02-15', description: 'Monthly Salary', type: 'income', amount: 75000, status: 'completed', category: 'Salary' },
  { id: '2', date: '2026-02-14', description: 'Grocery Shopping', type: 'expense', amount: 3500, status: 'completed', category: 'Food' },
  { id: '3', date: '2026-02-13', description: 'Performance Bonus', type: 'income', amount: 15000, status: 'completed', category: 'Bonus' },
  { id: '4', date: '2026-02-12', description: 'Rent Payment', type: 'expense', amount: 12000, status: 'completed', category: 'Housing' },
  { id: '5', date: '2026-02-11', description: 'Freelance Project', type: 'income', amount: 25000, status: 'pending', category: 'Freelance' },
  { id: '6', date: '2026-02-10', description: 'Electric Bill', type: 'expense', amount: 2500, status: 'completed', category: 'Utilities' },
  { id: '7', date: '2026-02-09', description: 'Investment Return', type: 'income', amount: 8500, status: 'completed', category: 'Investment' },
  { id: '8', date: '2026-02-08', description: 'Medical Insurance', type: 'expense', amount: 5000, status: 'completed', category: 'Healthcare' },
];

export function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Transaction History</h3>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                filterType === 'all' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                filterType === 'income' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                filterType === 'expense' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600'
              }`}
            >
              Expenses
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm text-gray-900">{transaction.description}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{transaction.category}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className={`py-4 px-4 text-right text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
