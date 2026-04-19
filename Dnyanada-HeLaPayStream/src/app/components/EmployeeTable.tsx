'use client';
import { User, Activity, ExternalLink } from 'lucide-react';

export const EmployeeTable = ({ streams }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 overflow-hidden">
    <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
      <User className="text-teal-400" /> Organization Workforce
    </h3>
    <table className="w-full text-left">
      <thead>
        <tr className="text-slate-500 text-xs uppercase tracking-widest border-b border-white/5">
          <th className="pb-4">Employee Address</th>
          <th className="pb-4">Stream Rate</th>
          <th className="pb-4">Status</th>
          <th className="pb-4 text-right">Activity</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {streams.map((s: any, i: number) => (
          <tr key={i} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
            <td className="py-6 font-mono text-slate-300">{s.address.slice(0,6)}...{s.address.slice(-4)}</td>
            <td className="py-6 font-black text-teal-400">${s.rate}/sec</td>
            <td className="py-6">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full">ACTIVE</span>
            </td>
            <td className="py-6 text-right">
              <button className="p-2 hover:bg-teal-500/20 rounded-lg transition-all text-slate-500 hover:text-teal-400">
                <ExternalLink size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);