import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  iconBg?: string;
}

export function StatCard({ icon, title, value, subtitle, iconBg = 'bg-blue-400' }: StatCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-2">{title}</p>
          <p className="text-3xl font-semibold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`${iconBg} p-3 rounded-xl text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
