import { useState, useRef, ChangeEvent } from 'react';
import { useContractWrite, useWaitForTransaction, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { streamManagerABI } from '../abi/streamManager';
import { contracts } from '../contracts';

interface CSVRow {
    employee: string;
    ratePerMonth: string;
    taxBps: string;
}

function parseCSV(text: string): CSVRow[] {
    const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    // Skip header if present
    const start = lines[0]?.toLowerCase().includes('employee') ? 1 : 0;
    const rows: CSVRow[] = [];

    for (let i = start; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        if (cols.length >= 3) {
            rows.push({
                employee: cols[0],
                ratePerMonth: cols[1],
                taxBps: cols[2],
            });
        }
    }
    return rows;
}

export default function BatchUpload() {
    const { isConnected } = useAccount();
    const fileRef = useRef<HTMLInputElement>(null);
    const [rows, setRows] = useState<CSVRow[]>([]);
    const [fileName, setFileName] = useState('');

    const {
        write: batchCreate,
        data: txData,
        isLoading: isSending,
    } = useContractWrite({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'batchCreateStreams',
    });

    const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
        hash: txData?.hash,
    });

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            setRows(parseCSV(text));
        };
        reader.readAsText(file);
    };

    const handleSubmit = () => {
        if (!batchCreate || rows.length === 0) return;

        const inputs = rows.map((r) => ({
            employee: r.employee as `0x${string}`,
            ratePerSecond: parseEther(r.ratePerMonth) / BigInt(30 * 24 * 3600),
            taxBps: parseInt(r.taxBps),
        }));

        batchCreate({ args: [inputs] });
    };

    const isWorking = isSending || isConfirming;
    const hasConfig = !!contracts.streamManager;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold">Batch Create (CSV)</h3>
            <p className="mt-1 text-sm text-gray-500">
                Upload a CSV with columns: <code className="text-gray-400">employee, ratePerMonth, taxBps</code>
            </p>

            {/* File picker */}
            <div className="mt-5">
                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFile}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-lg border border-dashed border-white/20 px-6 py-3 text-sm text-gray-400 transition hover:border-hela-500 hover:text-white"
                >
                    {fileName || 'Choose CSV file…'}
                </button>
            </div>

            {/* Preview */}
            {rows.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                                <th className="py-2 pr-4">Employee</th>
                                <th className="py-2 pr-4">Monthly HLUSD</th>
                                <th className="py-2">Tax BPS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={i} className="border-b border-white/5 text-gray-300">
                                    <td className="py-2 pr-4 font-mono text-xs">
                                        {r.employee.slice(0, 6)}…{r.employee.slice(-4)}
                                    </td>
                                    <td className="py-2 pr-4">{r.ratePerMonth}</td>
                                    <td className="py-2">{r.taxBps}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="mt-2 text-xs text-gray-500">
                        {rows.length} stream{rows.length > 1 ? 's' : ''} to create
                    </p>
                </div>
            )}

            {/* Submit */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={!isConnected || !hasConfig || isWorking || rows.length === 0}
                className="mt-5 w-full rounded-xl bg-hela-600 py-3 text-sm font-semibold text-white shadow-lg shadow-hela-600/20 transition hover:bg-hela-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isSending
                    ? 'Confirm in Wallet…'
                    : isConfirming
                        ? 'Confirming…'
                        : `Batch Create ${rows.length} Stream${rows.length !== 1 ? 's' : ''}`}
            </button>

            {isSuccess && (
                <p className="mt-3 text-center text-sm text-green-400">
                    ✅ Batch created successfully!
                </p>
            )}
        </div>
    );
}
