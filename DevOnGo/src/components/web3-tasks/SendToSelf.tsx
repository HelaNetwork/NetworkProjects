import { useState, type KeyboardEvent } from "react";
import { ethers } from "ethers";
import { CheckCircle2, XCircle, Loader2, Send } from "lucide-react";

const SendToSelf = () => {
    const [txHash, setTxHash] = useState("");
    const [status, setStatus] = useState<"pending" | "success" | "failed" | "idle">("idle");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const HELA_RPC = "https://testnet-rpc.helachain.com";

    const verifyTx = async () => {
        if (!txHash.trim()) {
            setStatus("failed");
            setError("Please enter a transaction hash");
            return;
        }

        try {
            setIsLoading(true);
            setStatus("pending");
            setError(null);

            if (!(window as any).ethereum) {
                setStatus("failed");
                setError("MetaMask is not installed");
                return;
            }

            const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
            await browserProvider.send("eth_requestAccounts", []);
            const signer = await browserProvider.getSigner();
            const userAddress = await signer.getAddress();

            const provider = new ethers.JsonRpcProvider(HELA_RPC);
            const tx = await provider.getTransaction(txHash);

            if (!tx) {
                setStatus("failed");
                setError("Transaction not found on the blockchain");
                return;
            }

            const from = tx.from?.toLowerCase();
            const to = tx.to?.toLowerCase();
            const user = userAddress.toLowerCase();

            if (from === user && to === user) {
                setStatus("success");
            } else {
                setStatus("failed");
                setError("This is not a self-transfer transaction");
            }
        } catch (err) {
            console.error(err);
            setStatus("failed");
            setError("Error verifying transaction");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            verifyTx();
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-100 via-sky-50 to-emerald-50 p-6">
            <div className="max-w-md mx-auto">
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-sky-100 to-emerald-100 px-6 py-8 border-b border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-sky-200/50 rounded-lg">
                                <Send className="w-5 h-5 text-sky-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">Verify Self-Transfer</h1>
                        </div>
                        <p className="text-slate-600 text-sm ml-11">Confirm your self-transfer transaction</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Input Section */}
                        <div className="space-y-3">
                            <label htmlFor="txHashInput" className="block text-sm font-semibold text-slate-700">
                                Transaction Hash
                            </label>
                            <div className="relative">
                                <input
                                    id="txHashInput"
                                    type="text"
                                    placeholder="0x..."
                                    value={txHash}
                                    onChange={(e) => {
                                        setTxHash(e.target.value);
                                        setStatus("idle");
                                    }}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white/70 text-slate-900 placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-50 text-sm font-mono"
                                />
                            </div>
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={verifyTx}
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-sky-300 to-emerald-300 text-slate-700 font-semibold rounded-xl hover:from-sky-400 hover:to-emerald-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Verify Transaction</span>
                                </>
                            )}
                        </button>

                        {/* Status Messages */}
                        {status === "success" && (
                            <div className="bg-gradient-to-r from-emerald-100/80 to-teal-100/80 border border-emerald-300 rounded-xl p-4 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-emerald-800">Verified!</p>
                                        <p className="text-emerald-700 text-sm mt-1">This is a valid self-transfer transaction.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === "failed" && (
                            <div className="bg-gradient-to-r from-rose-100/80 to-orange-100/80 border border-rose-300 rounded-xl p-4 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-rose-800">Verification Failed</p>
                                        <p className="text-rose-700 text-sm mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-slate-100/50 to-sky-100/50 px-6 py-4 border-t border-slate-200">
                        <p className="text-xs text-slate-600 text-center">
                            💡 Paste the transaction hash from your wallet's transaction history
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendToSelf;
