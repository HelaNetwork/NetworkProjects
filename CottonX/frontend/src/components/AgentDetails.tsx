"use client"

import { pixelify_sans } from '@/app/fonts';

interface AgentDetailsProps {
    ens?: string;
    chain?: string;
    resources?: string[];
}

const AgentDetails = ({ ens, resources = [] }: AgentDetailsProps) => {
    return (
        <div className="bg-card rounded-lg p-4 h-full overflow-y-auto">
            <h2 className={`${pixelify_sans.className} text-xl mb-4 text-blue-900`}>Agent Details</h2>

            <div className="space-y-4 text-black">
                {/* HeLa Network section */}
                <div className="border border-blue-100 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-base">⛓️</span>
                        <h3 className="text-sm font-semibold text-blue-900">Powered by HeLa</h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        CottonX runs on HeLa — a modular L1 blockchain built for real-world use. 
                        HeLa separates execution from data storage, which keeps things fast and cheap 
                        without sacrificing security.
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        All agent wallets, contract deployments, and on-chain transactions in this app 
                        happen on the HeLa Testnet. The native currency is HELA.
                    </p>
                    <div className="pt-1 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Network</span>
                            <span className="font-medium text-gray-700">HeLa Testnet</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Chain ID</span>
                            <span className="font-mono text-gray-700">666888</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Currency</span>
                            <span className="font-medium text-gray-700">HELA</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">RPC</span>
                            <span className="font-mono text-gray-700 truncate ml-2">testnet-rpc.helachain.com</span>
                        </div>
                    </div>
                    <a
                        href="https://testnet-blockexplorer.helachain.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-600 hover:underline pt-1"
                    >
                        View on HeLa Explorer →
                    </a>
                </div>

                {/* ENS */}
                <div>
                    <h3 className="text-sm font-semibold text-blue-900">ENS</h3>
                    <p className="text-sm text-gray-600">{ens || 'Not set'}</p>
                </div>

                {/* Resources */}
                {resources.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900">Resources</h3>
                        <ul className="text-sm list-disc list-inside text-gray-600">
                            {resources.map((resource, index) => (
                                <li key={index}>{resource}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDetails;
