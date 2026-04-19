import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, Outlet, useLocation } from 'react-router-dom';

const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/hr', label: 'HR Dashboard' },
    { to: '/employee', label: 'Employee' },
];

export default function Layout() {
    const { pathname } = useLocation();

    return (
        <div className="min-h-screen flex flex-col">
            {/* ── Nav ────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-lg">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link to="/" className="text-xl font-extrabold tracking-tight text-hela-400">
                        Pay<span className="text-white">Stream</span>
                    </Link>

                    <nav className="hidden gap-6 md:flex">
                        {navLinks.map((l) => (
                            <Link
                                key={l.to}
                                to={l.to}
                                className={`text-sm font-medium transition-colors hover:text-hela-400 ${pathname === l.to ? 'text-hela-400' : 'text-gray-400'
                                    }`}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>

                    <ConnectButton
                        accountStatus="address"
                        chainStatus="icon"
                        showBalance={false}
                    />
                </div>
            </header>

            {/* ── Content ────────────────────────────────────────── */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* ── Footer ─────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-600">
                PayStream · Built on HeLa Chain
            </footer>
        </div>
    );
}
