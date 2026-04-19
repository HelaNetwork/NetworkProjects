import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { TransactionGraph } from './components/TransactionGraph';
import { TransactionHistory } from './components/TransactionHistory';
import { PersonalSetup } from './components/PersonalSetup';
import { YieldFeatures } from './components/YieldFeatures';
import { 
  Wallet, 
  TrendingUp, 
  Calendar, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CreditCard
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = {
    totalBalance: 525000,
    monthlyIncome: 75000,
    monthlyExpenses: 22000,
    nextPayrollDate: '30 March 2026',
    conversionAmount: 6320.48,
    availableBalance: 503000,
  };

  const recentActivities = [
    { type: 'income', title: 'Salary Credited', amount: 75000, time: '2 hours ago' },
    { type: 'expense', title: 'Rent Payment', amount: 12000, time: '1 day ago' },
    { type: 'income', title: 'Freelance Payment', amount: 25000, time: '2 days ago' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<Wallet className="w-6 h-6" />}
                title="Total Available Balance"
                value={`₹${stats.availableBalance.toLocaleString()}`}
                subtitle="Current balance"
                iconBg="bg-purple-500"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Monthly Income"
                value={`₹${stats.monthlyIncome.toLocaleString()}`}
                subtitle="+15% from last month"
                iconBg="bg-green-500"
              />
              <StatCard
                icon={<CreditCard className="w-6 h-6" />}
                title="Monthly Expenses"
                value={`₹${stats.monthlyExpenses.toLocaleString()}`}
                subtitle="-8% from last month"
                iconBg="bg-pink-500"
              />
              <StatCard
                icon={<Calendar className="w-6 h-6" />}
                title="Next Payroll Date"
                value={stats.nextPayrollDate}
                iconBg="bg-cyan-500"
              />
            </div>

            {/* Conversion Amount Card */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-2">Conversion Amount (USD)</p>
                  <p className="text-4xl font-bold mb-1">${stats.conversionAmount.toLocaleString()}</p>
                  <p className="text-white/80 text-sm">≈ ₹{stats.totalBalance.toLocaleString()} INR</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <Activity className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Transaction Graph */}
            <TransactionGraph />

            {/* Recent Activity */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        activity.type === 'income' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {activity.type === 'income' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{activity.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      activity.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {activity.type === 'income' ? '+' : '-'}₹{activity.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'personal':
        return <PersonalSetup />;

      case 'transactions':
        return (
          <div className="space-y-6">
            <TransactionGraph />
            <TransactionHistory />
          </div>
        );

      case 'history':
        return <TransactionHistory />;

      case 'yield':
        return <YieldFeatures />;

      case 'settings':
        return (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Notifications
                </label>
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">Receive transaction alerts</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Two-Factor Authentication
                </label>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Enable 2FA
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Password
                </label>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'personal' && 'Personal Setup'}
              {activeTab === 'transactions' && 'Transactions'}
              {activeTab === 'history' && 'Transaction History'}
              {activeTab === 'yield' && 'Yield & Investments'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="text-white/80">
              {activeTab === 'overview' && 'Welcome back! Here\'s your financial overview.'}
              {activeTab === 'personal' && 'Manage your personal information and preferences.'}
              {activeTab === 'transactions' && 'View and analyze your transactions.'}
              {activeTab === 'history' && 'Complete history of all your transactions.'}
              {activeTab === 'yield' && 'Manage your yield accounts and investments.'}
              {activeTab === 'settings' && 'Configure your account settings.'}
            </p>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
