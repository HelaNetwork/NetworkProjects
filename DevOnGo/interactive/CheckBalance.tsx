import { useState, type KeyboardEvent } from "react";
import { CheckCircle2, XCircle, Loader2, Wallet } from "lucide-react";
import { useLessonTaskVerification } from "@/src/contexts/LessonTaskVerificationContext";

const CheckBalance = () => {
    const lessonTask = useLessonTaskVerification();
    const [status, setStatus] = useState<"success" | "failed" | "pending" | "idle">("idle");
    const [error, setError] = useState<string | null>(null);
    const [input, setInput] = useState<string>("");
    const [actualBalance, setActualBalance] = useState<number | null>(null);

    const checkBalance = async () => {
        if (!input || isNaN(Number(input))) {
            setStatus("failed");
            setError("Please enter a valid balance amount");
            return;
        }

        setStatus("pending");
        setError(null);
        setActualBalance(null);

        if (!(window as any).ethereum) {
            setStatus("failed");
            setError("MetaMask not found. Please install MetaMask.");
            return;
        }

        try {
            const accounts = await (window as any).ethereum.request({
                method: "eth_requestAccounts",
            });

            const balanceHex = await (window as any).ethereum.request({
                method: "eth_getBalance",
                params: [accounts[0], "latest"],
            });

            const balance = parseInt(balanceHex, 16) / 1e18;
            setActualBalance(balance);

            const isCorrect = Math.abs(Number(input) - balance) < 0.0001;

            if (isCorrect) {
                setStatus("success");
                lessonTask?.markTaskVerified();
            } else {
                setStatus("failed");
                setError(`Balance mismatch. Your actual balance: ${balance.toFixed(4)} ETH`);
            }
        } catch (err) {
            console.error(err);
            setStatus("failed");
            setError("Error fetching balance. Please try again.");
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            checkBalance();
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-100 via-sky-50 to-emerald-50 p-6">
            <div className="max-w-md mx-auto">
                {/* Card Container */}
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-sky-100 to-emerald-100 px-6 py-8 border-b border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-sky-200/50 rounded-lg">
                                <Wallet className="w-5 h-5 text-sky-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">Check Balance</h1>
                        </div>
                        <p className="text-slate-600 text-sm ml-11">Verify your wallet balance instantly</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Input Section */}
                        <div className="space-y-3">
                            <label htmlFor="balanceInput" className="block text-sm font-semibold text-slate-700">
                                Enter Expected Balance (ETH)
                            </label>
                            <div className="relative">
                                <input
                                    id="balanceInput"
                                    type="number"
                                    step="0.0001"
                                    placeholder="e.g., 2.5"
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        setStatus("idle");
                                    }}
                                    onKeyPress={handleKeyPress}
                                    disabled={status === "pending"}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white/70 text-slate-900 placeholder-slate-400 disabled:opacity-50 disabled:bg-slate-50"
                                />
                                <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">ETH</span>
                            </div>
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={checkBalance}
                            disabled={status === "pending"}
                            className="w-full py-3 px-4 bg-gradient-to-r from-sky-300 to-emerald-300 text-slate-700 font-semibold rounded-xl hover:from-sky-400 hover:to-emerald-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                            {status === "pending" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <Wallet className="w-5 h-5" />
                                    <span>Verify Balance</span>
                                </>
                            )}
                        </button>

                        {/* Status Messages */}
                        {status === "success" && (
                            <div className="bg-gradient-to-r from-emerald-100/80 to-teal-100/80 border border-emerald-300 rounded-xl p-4 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-emerald-800">Balance Verified!</p>
                                        <p className="text-emerald-700 text-sm mt-1">Your wallet balance matches perfectly.</p>
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

                        {/* Info Box */}
                        {actualBalance !== null && (
                            <div className="bg-gradient-to-r from-sky-100/60 to-blue-100/60 border border-sky-300 rounded-xl p-4">
                                <p className="text-sm text-slate-700">
                                    <span className="font-semibold text-slate-800">Actual Balance:</span>{" "}
                                    <span className="text-sky-600 font-mono font-semibold ml-1">{actualBalance.toFixed(4)} ETH</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-slate-100/50 to-sky-100/50 px-6 py-4 border-t border-slate-200">
                        <p className="text-xs text-slate-600 text-center">
                            💡 Ensure MetaMask is connected to proceed
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500">
                        Powered by Ethereum wallet verification
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckBalance;