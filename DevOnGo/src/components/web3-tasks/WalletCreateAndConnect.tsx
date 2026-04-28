import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Wallet, Plus, LogIn } from "lucide-react";

type Status =
    | "checking"
    | "no_metamask"
    | "no_account"
    | "wallet_exists"
    | "connected";

const WalletCreateAndConnect = () => {
    const [status, setStatus] = useState<Status>("checking");
    const [address, setAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const checkWallet = async () => {
        setIsLoading(true);
        const ethereum = (window as any).ethereum;

        if (!ethereum || !ethereum.isMetaMask) {
            setStatus("no_metamask");
            setIsLoading(false);
            return;
        }

        const accounts = await ethereum.request({
            method: "eth_accounts",
        });

        if (accounts.length > 0) {
            setAddress(accounts[0]);
            setStatus("wallet_exists");
        } else {
            setStatus("no_account");
        }
        setIsLoading(false);
    };

    const connectWallet = async () => {
        setIsLoading(true);
        const ethereum = (window as any).ethereum;

        try {
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });

            setAddress(accounts[0]);
            setStatus("connected");
        } catch (err) {
            console.error(err);
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
                                <Wallet className="w-5 h-5 text-sky-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">Wallet Status</h1>
                        </div>
                        <p className="text-slate-600 text-sm ml-11">Check and connect your wallet</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {status === "checking" && (
                            <div className="text-center space-y-4">
                                <p className="text-slate-600 text-sm">Click the button below to check your wallet status</p>
                                <button
                                    onClick={checkWallet}
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-300 to-emerald-300 text-slate-700 font-semibold rounded-xl hover:from-sky-400 hover:to-emerald-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Checking...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="w-5 h-5" />
                                            <span>Check Wallet</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {status === "no_metamask" && (
                            <div className="bg-gradient-to-r from-rose-100/80 to-orange-100/80 border border-rose-300 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-rose-800">MetaMask Not Found</p>
                                        <p className="text-rose-700 text-sm mt-2">Please install MetaMask to continue</p>
                                        <a
                                            href="https://metamask.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-3 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition"
                                        >
                                            Download MetaMask
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === "no_account" && (
                            <>
                                <div className="bg-gradient-to-r from-amber-100/80 to-orange-100/80 border border-amber-300 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-amber-800">No Wallet Connected</p>
                                            <p className="text-amber-700 text-sm mt-1">Create or connect your wallet to continue</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={connectWallet}
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-300 to-emerald-300 text-slate-700 font-semibold rounded-xl hover:from-sky-400 hover:to-emerald-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Connecting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            <span>Connect Wallet</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {status === "wallet_exists" && (
                            <div className="bg-gradient-to-r from-emerald-100/80 to-teal-100/80 border border-emerald-300 rounded-xl p-4 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-emerald-800">Wallet Already Connected ✅</p>
                                        <p className="text-emerald-700 text-sm mt-2 font-mono break-all">{address}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === "connected" && (
                            <div className="bg-gradient-to-r from-emerald-100/80 to-teal-100/80 border border-emerald-300 rounded-xl p-4 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-emerald-800">Wallet Connected Successfully ✅</p>
                                        <p className="text-emerald-700 text-sm mt-2 font-mono break-all">{address}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-slate-100/50 to-sky-100/50 px-6 py-4 border-t border-slate-200">
                        <p className="text-xs text-slate-600 text-center">
                            💡 Keep your wallet secure and never share your private keys
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletCreateAndConnect;
