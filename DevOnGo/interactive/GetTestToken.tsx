import { useState } from "react";
import { ethers } from "ethers";
import { CheckCircle2, XCircle, Loader2, Coins } from "lucide-react";
import { useLessonTaskVerification } from "@/src/contexts/LessonTaskVerificationContext";

const HELA_TESTNET = {
    chainId: "0xA2D08",
    chainName: "Hela Blockchain",
    nativeCurrency: {
        name: "HLUSD",
        symbol: "HLUSD",
        decimals: 18,
    },
    rpcUrls: ["https://testnet-rpc.helachain.com"],
    blockExplorerUrls: ["https://testnet-blockexplorer.helachain.com"],
};

const CheckHelaFaucet = () => {
    const lessonTask = useLessonTaskVerification();
    const [status, setStatus] = useState<"pending" | "success" | "failed" | "idle">("idle");
    const [error, setError] = useState<string | null>(null);
    const [initialBalance, setInitialBalance] = useState<number | null>(null);
    const [currentBalance, setCurrentBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<"initial" | "verify">("initial");

    const isMetaMaskInstalled = () =>
        typeof window !== "undefined" && Boolean((window as any).ethereum?.isMetaMask);

    const connectToHela = async () => {
        if (!isMetaMaskInstalled()) {
            setStatus("failed");
            setError("MetaMask not installed");
            return null;
        }

        try {
            const accounts = await (window as any).ethereum.request({
                method: "eth_requestAccounts",
            });

            if (accounts.length === 0) {
                setStatus("failed");
                setError("Wallet not connected");
                return null;
            }

            try {
                await (window as any).ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: HELA_TESTNET.chainId }],
                });
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    await (window as any).ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [HELA_TESTNET],
                    });
                } else {
                    throw switchError;
                }
            }

            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            return { provider, address };

        } catch (err) {
            console.error(err);
            setStatus("failed");
            setError("Connection failed");
            return null;
        }
    };

    const getBalance = async () => {
        const data = await connectToHela();
        if (!data) return null;

        const { provider, address } = data;
        const balanceWei = await provider.getBalance(address);
        const balance = parseFloat(ethers.formatEther(balanceWei));
        return balance;
    };

    const handleInitial = async () => {
        setIsLoading(true);
        setStatus("pending");
        const bal = await getBalance();
        if (bal !== null) {
            setInitialBalance(bal);
            setStatus("idle");
            setStep("verify");
            setError(null);
        }
        setIsLoading(false);
    };

    const handleVerify = async () => {
        if (initialBalance === null) {
            setStatus("failed");
            setError("First check initial balance");
            return;
        }

        setIsLoading(true);
        setStatus("pending");
        const bal = await getBalance();
        if (bal !== null) {
            setCurrentBalance(bal);

            if (bal - initialBalance > 0.0001) {
                setStatus("success");
                lessonTask?.markTaskVerified();
            } else {
                setStatus("failed");
                setError("No tokens received yet");
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-gradient-to-br from-slate-100 via-sky-50 to-emerald-50 p-6">
            <div className="max-w-md mx-auto">
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-sky-100 to-emerald-100 px-6 py-8 border-b border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-sky-200/50 rounded-lg">
                                <Coins className="w-5 h-5 text-sky-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">Get Test Tokens</h1>
                        </div>
                        <p className="text-slate-600 text-sm ml-11">Claim HLUSD from faucet</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {step === "initial" ? (
                            <>
                                <p className="text-sm text-slate-600 text-center">Check your current balance before claiming tokens</p>
                                <button
                                    onClick={handleInitial}
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-300 to-emerald-300 text-slate-700 font-semibold rounded-xl hover:from-sky-400 hover:to-emerald-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                                            <span>Checking...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Coins className="w-5 h-5" />
                                            <span>Check Initial Balance</span>
                                        </>
                                    )}
                                </button>

                                {initialBalance !== null && (
                                    <div className="bg-gradient-to-r from-sky-100/60 to-blue-100/60 border border-sky-300 rounded-xl p-4">
                                        <p className="text-sm text-slate-700">
                                            <span className="font-semibold text-slate-800">Initial Balance:</span>{" "}
                                            <span className="text-sky-600 font-mono font-semibold ml-1">{initialBalance.toFixed(4)} HLUSD</span>
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {initialBalance !== null && (
                                    <div className="bg-gradient-to-r from-sky-100/60 to-blue-100/60 border border-sky-300 rounded-xl p-4">
                                        <p className="text-sm text-slate-700">
                                            <span className="font-semibold text-slate-800">Balance to Beat:</span>{" "}
                                            <span className="text-sky-600 font-mono font-semibold ml-1">{initialBalance.toFixed(4)} HLUSD</span>
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 justify-center py-2">
                                    <div className="flex-1 h-px bg-slate-300"></div>
                                    <p className="text-xs text-slate-500 font-medium">👉 Claim tokens from faucet</p>
                                    <div className="flex-1 h-px bg-slate-300"></div>
                                </div>

                                <button
                                    onClick={handleVerify}
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
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span>Verify After Claim</span>
                                        </>
                                    )}
                                </button>

                                {currentBalance !== null && (
                                    <div className="bg-gradient-to-r from-sky-100/60 to-blue-100/60 border border-sky-300 rounded-xl p-4">
                                        <p className="text-sm text-slate-700">
                                            <span className="font-semibold text-slate-800">Current Balance:</span>{" "}
                                            <span className="text-sky-600 font-mono font-semibold ml-1">{currentBalance.toFixed(4)} HLUSD</span>
                                        </p>
                                    </div>
                                )}

                                {status === "success" && (
                                    <div className="bg-gradient-to-r from-emerald-100/80 to-teal-100/80 border border-emerald-300 rounded-xl p-4 animate-in slide-in-from-top-2">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-emerald-800">Tokens Received!</p>
                                                <p className="text-emerald-700 text-sm mt-1">Your balance has been updated successfully.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {status === "failed" && error && (
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
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-slate-100/50 to-sky-100/50 px-6 py-4 border-t border-slate-200">
                        <p className="text-xs text-slate-600 text-center">
                            💡 Visit Hela faucet to claim your test tokens
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckHelaFaucet;