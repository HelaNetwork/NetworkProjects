import { TrendingUp, DollarSign, PieChart, ArrowUpRight, Lock, Unlock } from 'lucide-react';

export function YieldFeatures() {
  const yieldAccounts = [
    { name: 'Savings Account', apy: '4.5%', balance: 150000, status: 'active', growth: '+12.5%' },
    { name: 'Fixed Deposit', apy: '7.2%', balance: 300000, status: 'locked', growth: '+21.6%' },
    { name: 'Liquid Fund', apy: '5.8%', balance: 75000, status: 'active', growth: '+8.7%' },
  ];

  const totalYieldBalance = yieldAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const averageAPY = (yieldAccounts.reduce((sum, acc) => sum + parseFloat(acc.apy), 0) / yieldAccounts.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Yield Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Total</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Yield Balance</p>
          <p className="text-3xl font-bold">₹{totalYieldBalance.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <PieChart className="w-8 h-8" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Average</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Average APY</p>
          <p className="text-3xl font-bold">{averageAPY}%</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Monthly</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Expected Earnings</p>
          <p className="text-3xl font-bold">₹{(totalYieldBalance * 0.005).toFixed(0)}</p>
        </div>
      </div>

      {/* Yield Accounts List */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Yield Accounts</h3>
        
        <div className="space-y-4">
          {yieldAccounts.map((account, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  account.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {account.status === 'active' ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{account.name}</p>
                  <p className="text-sm text-gray-600">
                    {account.status === 'active' ? 'Active' : 'Locked'} • APY: {account.apy}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="font-semibold text-gray-900">₹{account.balance.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">{account.growth}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yield Calculator */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Yield Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount (₹)</label>
            <input
              type="number"
              placeholder="100000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected APY (%)</label>
            <input
              type="number"
              placeholder="5.5"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period (months)</label>
            <input
              type="number"
              placeholder="12"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
          Calculate Potential Earnings
        </button>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-900">
            <strong>Estimated Return:</strong> Calculate your potential earnings based on different investment scenarios
          </p>
        </div>
      </div>
    </div>
  );
}
