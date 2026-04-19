'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNavigation = (path: string) => {
    setLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 1000);
  };
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-black rounded-xl flex items-center justify-center shadow-xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-6xl font-bold text-black mb-6">
            Welcome to <span className="underline">HelaPe</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Real-time payroll on the blockchain. Earn salary every second, withdraw anytime.
          </p>

          <div className="flex justify-center gap-6">
            <div
              onClick={() => handleNavigation('/employee')}
              className="cursor-pointer px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-lg font-bold text-lg shadow-lg transition-all"
            >
              Employee Dashboard
            </div>
            <div
              onClick={() => handleNavigation('/hr')}
              className="cursor-pointer px-8 py-4 bg-white hover:bg-gray-100 text-black border-2 border-black rounded-lg font-bold text-lg shadow-lg transition-all"
            >
              Employer Dashboard
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg p-8 shadow-md border-2 border-gray-300 hover:border-black transition-all">
            <div className="w-14 h-14 bg-gray-900 text-white rounded-lg flex items-center justify-center mb-4 text-2xl font-bold">
              RT
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Real-Time Streaming</h3>
            <p className="text-gray-600">
              Salary accumulates every second. Watch your earnings grow in real-time.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md border-2 border-gray-300 hover:border-black transition-all">
            <div className="w-14 h-14 bg-gray-900 text-white rounded-lg flex items-center justify-center mb-4 text-2xl font-bold">
              IW
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Instant Withdrawals</h3>
            <p className="text-gray-600">
              Access your earned salary anytime. No waiting periods, no delays.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md border-2 border-gray-300 hover:border-black transition-all">
            <div className="w-14 h-14 bg-gray-900 text-white rounded-lg flex items-center justify-center mb-4 text-2xl font-bold">
              BS
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Blockchain Security</h3>
            <p className="text-gray-600">
              Powered by smart contracts on HeLa Testnet. Transparent and secure.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold text-black mb-12">How It Works</h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="text-left bg-gray-100 rounded-lg p-8 border-2 border-gray-300">
              <h3 className="text-2xl font-bold text-black mb-4">For Employers</h3>
              <ol className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">1</span>
                  <span>Connect your wallet and mint HLUSD test tokens</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">2</span>
                  <span>Create a salary stream with employee address and amount</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">3</span>
                  <span>Manage streams: pause, resume, or cancel as needed</span>
                </li>
              </ol>
            </div>

            <div className="text-left bg-gray-100 rounded-lg p-8 border-2 border-gray-300">
              <h3 className="text-2xl font-bold text-black mb-4">For Employees</h3>
              <ol className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">1</span>
                  <span>Get your Stream ID from your employer</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">2</span>
                  <span>Enter your Stream ID to view your real-time earnings</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">3</span>
                  <span>Withdraw your earned salary anytime you need it</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center text-gray-500 border-t border-gray-300 pt-8">
          <p className="text-sm">
            Powered by Smart Contracts on HeLa Testnet
          </p>
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-[#111] flex items-center justify-center">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
}