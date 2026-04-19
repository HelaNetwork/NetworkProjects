import { Home, User, CreditCard, History, Settings, TrendingUp } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'personal', label: 'Personal Setup', icon: User },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'history', label: 'History', icon: History },
    { id: 'yield', label: 'Yield', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white/10 backdrop-blur-sm p-6 min-h-screen">
      <div className="mb-8">
        <h2 className="text-white text-xl font-semibold mb-1">Employee</h2>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
