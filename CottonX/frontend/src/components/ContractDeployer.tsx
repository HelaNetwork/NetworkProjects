"use client";

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiLoader, FiZap } from 'react-icons/fi';

interface ContractDeployerProps {
    fileId: string;
    contractName: string;
    userId: string;
    onDeploySuccess?: (contractAddress: string, txHash: string) => void;
}

interface AbiInput {
    name: string;
    type: string;
}

interface DeploymentStatus {
    stage: 'idle' | 'deploying' | 'success' | 'error';
    message: string;
    contractAddress?: string;
    txHash?: string;
}

const ContractDeployer = ({ fileId, userId, onDeploySuccess }: ContractDeployerProps) => {
    const [status, setStatus] = useState<DeploymentStatus>({ stage: 'idle', message: '' });
    const [constructorInputs, setConstructorInputs] = useState<AbiInput[]>([]);
    const [argValues, setArgValues] = useState<Record<string, string>>({});
    const [loadingAbi, setLoadingAbi] = useState(true);

    // Fetch ABI on mount to detect constructor params
    useEffect(() => {
        const fetchAbi = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
                const res = await fetch(`${backendUrl}/api/contracts/${fileId}?userId=${userId}`);
                if (!res.ok) return;
                const data = await res.json();
                const abi: any[] = data?.data?.abi || [];
                const ctor = abi.find((x) => x.type === 'constructor');
                const inputs: AbiInput[] = ctor?.inputs || [];
                setConstructorInputs(inputs);
                // Init empty values
                const init: Record<string, string> = {};
                inputs.forEach((i) => { init[i.name] = ''; });
                setArgValues(init);
            } catch {
                // silently ignore — user can still type args manually
            } finally {
                setLoadingAbi(false);
            }
        };
        fetchAbi();
    }, [fileId, userId]);

    const deployContract = async () => {
        try {
            // Build args array from individual fields
            const args = constructorInputs.map((input) => {
                const val = argValues[input.name] ?? '';
                // coerce uint/int types to numbers
                if (input.type.startsWith('uint') || input.type.startsWith('int')) {
                    return val;
                }
                return val;
            });

            // Validate all required args are filled
            const missing = constructorInputs.filter((i) => !(argValues[i.name] ?? '').trim());
            if (missing.length > 0) {
                setStatus({
                    stage: 'error',
                    message: `Missing required constructor args: ${missing.map((m) => m.name).join(', ')}`
                });
                return;
            }

            setStatus({ stage: 'deploying', message: 'Deploying contract on HeLa testnet...' });

            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
            const response = await fetch(`${backendUrl}/api/contracts/deploy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, fileId, constructorArgs: args })
            });

            const contentType = response.headers.get('content-type') || '';
            const result = contentType.includes('application/json')
                ? await response.json()
                : (() => { throw new Error(`Server error ${response.status}`); })();

            if (!response.ok || !result.success) {
                throw new Error(result?.error || result?.details || `HTTP ${response.status}`);
            }

            const { contractAddress, transactionHash } = result.data;
            setStatus({ stage: 'success', message: 'Contract deployed!', contractAddress, txHash: transactionHash });
            onDeploySuccess?.(contractAddress, transactionHash);

        } catch (error: any) {
            const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
            setStatus({
                stage: 'error',
                message: isNetworkError
                    ? 'Cannot reach backend (port 8080). Is it running?'
                    : (error?.message || 'Deployment failed')
            });
        }
    };

    const reset = () => {
        setStatus({ stage: 'idle', message: '' });
        const init: Record<string, string> = {};
        constructorInputs.forEach((i) => { init[i.name] = ''; });
        setArgValues(init);
    };

    if (loadingAbi) {
        return <div className="flex items-center gap-2 text-sm text-gray-500"><FiLoader className="animate-spin" size={14} /> Loading contract info...</div>;
    }

    return (
        <div className="space-y-3">
            {status.stage === 'idle' && (
                <>
                    {constructorInputs.length > 0 ? (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700">Constructor Arguments</p>
                            {constructorInputs.map((input) => (
                                <div key={input.name}>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        {input.name} <span className="text-gray-400">({input.type})</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={argValues[input.name] ?? ''}
                                        onChange={(e) => setArgValues((prev) => ({ ...prev, [input.name]: e.target.value }))}
                                        placeholder={`Enter ${input.name}`}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500">No constructor arguments required.</p>
                    )}

                    <button
                        onClick={deployContract}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <FiZap size={16} /> Deploy to HeLa Testnet
                    </button>
                </>
            )}

            {status.stage !== 'idle' && (
                <div className={`p-3 rounded-lg border-2 text-sm ${
                    status.stage === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
                    status.stage === 'error'   ? 'bg-red-50 border-red-500 text-red-800' :
                    'bg-blue-50 border-blue-500 text-blue-800'
                }`}>
                    <div className="flex items-start gap-2">
                        {status.stage === 'success'  && <FiCheck size={18} className="flex-shrink-0 mt-0.5" />}
                        {status.stage === 'error'    && <FiX size={18} className="flex-shrink-0 mt-0.5" />}
                        {status.stage === 'deploying' && <FiLoader size={18} className="flex-shrink-0 mt-0.5 animate-spin" />}

                        <div className="flex-1 space-y-2">
                            <p className="font-semibold">{status.message}</p>
                            {status.txHash && (
                                <p className="text-xs font-mono bg-white/50 p-2 rounded break-all">TX: {status.txHash}</p>
                            )}
                            {status.contractAddress && (
                                <p className="text-xs font-mono bg-white/50 p-2 rounded break-all">Contract: {status.contractAddress}</p>
                            )}
                            {(status.stage === 'success' || status.stage === 'error') && (
                                <button onClick={reset} className="text-xs underline hover:no-underline">
                                    {status.stage === 'success' ? 'Deploy another' : 'Try again'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractDeployer;
