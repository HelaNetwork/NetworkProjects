import { useState } from 'react';
import TreasuryCard from '../components/TreasuryCard';
import AddLiquidityForm from '../components/AddLiquidityForm';
import CreateStreamForm from '../components/CreateStreamForm';
import BatchUpload from '../components/BatchUpload';
import ScheduleBonusForm from '../components/ScheduleBonusForm';
import SetYieldRateForm from '../components/SetYieldRateForm';
import StreamsTable from '../components/StreamsTable';

type Tab = 'single' | 'batch';

export default function HRDashboard() {
    const [tab, setTab] = useState<Tab>('single');

    return (
        <div className="mx-auto max-w-6xl px-6 py-16">
            <h1 className="text-3xl font-bold tracking-tight">🏢 HR Dashboard</h1>
            <p className="mt-2 text-gray-400">
                Manage treasury, create streams, and monitor payroll.
            </p>

            {/* ── Stats Cards ──────────────────────────────────── */}
            <div className="mt-10">
                <TreasuryCard />

                {/* ── Add Liquidity ─────────────────────────────────── */}
                <div className="mt-8">
                    <AddLiquidityForm />
                </div>

                {/* ── Yield Rate Management ───────────────────────── */}
                <div className="mt-8">
                    <SetYieldRateForm />
                </div>
            </div>

            {/* ── Create Stream Section ────────────────────────── */}
            <div className="mt-12">
                <div className="mb-4 flex items-center gap-4">
                    <h2 className="text-xl font-semibold">Create Streams</h2>

                    {/* Tab switcher */}
                    <div className="ml-auto flex rounded-lg border border-white/10 text-sm">
                        <button
                            onClick={() => setTab('single')}
                            className={`px-4 py-1.5 transition ${tab === 'single'
                                ? 'bg-hela-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                } rounded-l-lg`}
                        >
                            Single
                        </button>
                        <button
                            onClick={() => setTab('batch')}
                            className={`px-4 py-1.5 transition ${tab === 'batch'
                                ? 'bg-hela-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                } rounded-r-lg`}
                        >
                            CSV Batch
                        </button>
                    </div>
                </div>

                {tab === 'single' ? <CreateStreamForm /> : <BatchUpload />}
            </div>

            {/* ── Schedule Bonus ────────────────────────────── */}
            <div className="mt-12">
                <h2 className="mb-4 text-xl font-semibold">Schedule Bonus</h2>
                <ScheduleBonusForm />
            </div>

            {/* ── Streams Table ────────────────────────────────── */}
            <div className="mt-12">
                <h2 className="mb-4 text-xl font-semibold">All Streams</h2>
                <StreamsTable />
            </div>
        </div>
    );
}
