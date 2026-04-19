import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <section className="relative flex flex-col items-center justify-center px-6 py-32 text-center">
            {/* Gradient glow */}
            <div className="pointer-events-none absolute -top-32 h-[500px] w-[700px] rounded-full bg-hela-600/20 blur-[140px]" />

            <h1 className="relative z-10 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                Streaming salaries
                <br />
                <span className="bg-gradient-to-r from-hela-400 to-cyan-400 bg-clip-text text-transparent">
                    on HeLa Chain
                </span>
            </h1>

            <p className="relative z-10 mt-6 max-w-xl text-lg text-gray-400">
                PayStream lets employers deposit once and stream HLUSD to employees every second —
                with built-in tax routing, scheduled bonuses, and gasless withdrawals.
            </p>

            <div className="relative z-10 mt-10 flex gap-4">
                <Link
                    to="/hr"
                    className="rounded-xl bg-hela-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-hela-600/30 transition hover:bg-hela-500"
                >
                    HR Dashboard
                </Link>
                <Link
                    to="/employee"
                    className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                    Employee Portal
                </Link>
            </div>
        </section>
    );
}
