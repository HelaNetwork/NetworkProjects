'use client';

import { ConnectWallet } from './ConnectWallet';

/**
 * Header component with wallet connection button
 */
export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">AI Wallet Assistant</h1>
        <ConnectWallet />
      </div>
    </header>
  );
}
