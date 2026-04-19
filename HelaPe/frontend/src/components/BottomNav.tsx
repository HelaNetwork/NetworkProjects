'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
    type: 'employer';
}

export function BottomNav({ type }: BottomNavProps) {
    const pathname = usePathname();

    const employerLinks = [
        { name: 'Dashboard', href: '#dashboard', icon: 'dashboard' },
        { name: 'Create Stream', href: '#create', icon: 'play' },
        { name: 'Active Streams', href: '#streams', icon: 'list' },
        { name: 'Treasury', href: '#treasury', icon: 'wallet' },
    ];

    const links = employerLinks;

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'dashboard':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                );
            case 'play':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                );
            case 'list':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                );
            case 'wallet':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const scrollToSection = (href: string) => {
        const hash = href.substring(1);
        const element = document.getElementById(hash);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-700 backdrop-blur-lg z-50 shadow-2xl border-t border-gray-600">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-around items-center h-16">
                    {links.map((link) => {
                        return (
                            <button
                                key={link.name}
                                onClick={() => scrollToSection(link.href)}
                                className="flex flex-col items-center justify-center space-y-1 px-4 py-2 rounded-lg transition-all text-gray-300 hover:text-white hover:bg-gray-700/50 active:bg-gray-600/50"
                            >
                                {getIcon(link.icon)}
                                <span className="text-xs font-medium">{link.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
