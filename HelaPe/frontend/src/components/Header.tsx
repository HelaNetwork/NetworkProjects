'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export function Header() {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo at Top Left */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                            HelaPe
                        </h1>
                    </Link>

                    {/* Connect Button */}
                    <div className="flex items-center space-x-4">
                        <ConnectButton
                            chainStatus="icon"
                            showBalance={false}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
