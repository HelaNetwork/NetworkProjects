'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    type: 'employee' | 'employer';
}

export function Sidebar({ type }: SidebarProps) {
    const pathname = usePathname();

    const employeeLinks = [
        { name: 'Dashboard', href: '/employee', icon: 'dashboard' },
        { name: 'Start Stream', href: '/employee#start', icon: 'play' },
        { name: 'Active Streams', href: '/employee#streams', icon: 'list' },
        { name: 'Treasury', href: '/employee#treasury', icon: 'wallet' },
    ];

    const employerLinks = [
        { name: 'Dashboard', href: '/hr', icon: 'dashboard' },
        { name: 'Start Stream', href: '/hr#start', icon: 'play' },
        { name: 'Active Streams', href: '/hr#streams', icon: 'list' },
        { name: 'Treasury', href: '/hr#treasury', icon: 'wallet' },
    ];

    const links = type === 'employee' ? employeeLinks : employerLinks;

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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

    return (
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
                <div className="flex items-center space-x-2 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">HP</span>
                    </div>
                    <span className="font-bold text-gray-900">HelaPe</span>
                </div>

                <nav className="space-y-2">
                    {links.map((link) => {
                        const isActive = pathname === link.href || (link.href.includes('#') && pathname === link.href.split('#')[0]);
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-purple-50 text-purple-600 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {getIcon(link.icon)}
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                    <p className="text-xs text-gray-600 text-center">
                        Powered by <span className="font-semibold text-purple-600">Smart Contracts</span> on <span className="font-semibold">HeLa Testnet</span>
                    </p>
                </div>
            </div>
        </aside>
    );
}
