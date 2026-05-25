import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Link2 } from "lucide-react";
import { useLessonTaskVerification } from "@/src/contexts/LessonTaskVerificationContext";

const HELA_TESTNET = {
    chainId: "0xA2D08",
    chainName: "Hela Blockchain Testnet",
    nativeCurrency: {
        name: "HLUSD",
        symbol: "HLUSD",
        decimals: 18,
    },
    rpcUrls: ["https://testnet-rpc.helachain.com"],
    blockExplorerUrls: ["https://testnet-blockexplorer.helachain.com"],
};

const CheckHelaConnection = () => {
    const lessonTask = useLessonTaskVerification();
    const [status, setStatus] = useState<"success" | "failed" | "pending" | "idle">("idle");
    const [error, setError] = useState<string | null>(null);
    const [chainId, setChainId] = useState<string | null>(null);

    const isMetaMaskInstalled = () =>
        typeof window !== "undefined" && Boolean((window as any).ethereum?.isMetaMask);

    const checkConnection = async () => {
        if (!isMetaMaskInstalled()) {
            setStatus("failed");
            setError("MetaMask is not installed");
            return;
        }

        setStatus("pending");

        try {
            const accounts = await (window as any).ethereum.request({
                method: "eth_requestAccounts",
            });

            if (accounts.length === 0) {
                setStatus("failed");
                setError("Not connected to Any Network");
                return;
            }
        } catch (err) {
            console.error("Error checking connection:", err);
            setStatus("failed");
            setError("Error connecting to Network");
            return;
        }

        try {
            await (window as any).ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: HELA_TESTNET.chainId }],
            });
            setStatus("success");
            setChainId(HELA_TESTNET.chainId);
            lessonTask?.markTaskVerified();
        } catch (switchError) {
            setStatus("failed");
            setError("Hela Testnet is not added to MetaMask");
            return;
        }
    }

    return (
        <div className="bg-gradient-to-br from-slate-100 via-sky-50 to-emerald-50 p-6">
            <div className="max-w-md mx-auto">
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-sky-100 to-emerald-100 px-6 py-8 border-b border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-sky-200/50 rounded-lg">
                                <Link2 className="w-5 h-5 text-sky-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">Hela Connection</h1>
                        </div>
                        <p className="text-slate-600 text-sm ml-11">Connect to Hela Blockchain Testnet</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <button
                            onClick={checkConnection}
                            disabled={status === "pending"}
                            className="w-full py-3 px-4 bg-gradient-to-r from-sky-300 to-emerald-300 text-slate-700 font-semibold rounded-xl hover:from-sky-400 hover:to-emerald-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                            {status === "pending" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-5 h-5" />
                                    <span>Connect Now</span>
                                </>
                            )}
                        </button>

                        {status === "success" && (
                            <div className="bg-gradient-to-r from-emerald-100/80 to-teal-100/80 border border-emerald-300 rounded-xl p-4 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-emerald-800">Connected Successfully!</p>
                                        <p className="text-emerald-700 text-sm mt-1">Chain ID: {chainId}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === "failed" && (
                            <div className="bg-gradient-to-r from-rose-100/80 to-orange-100/80 border border-rose-300 rounded-xl p-4 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-rose-800">Connection Failed</p>
                                        <p className="text-rose-700 text-sm mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-slate-100/50 to-sky-100/50 px-6 py-4 border-t border-slate-200">
                        <p className="text-xs text-slate-600 text-center">
                            💡 Make sure MetaMask is installed and connected
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckHelaConnection;