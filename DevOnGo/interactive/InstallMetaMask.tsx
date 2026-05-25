import { useState } from "react";
import { CheckCircle2, XCircle, Download, Loader2 } from "lucide-react";
import { useLessonTaskVerification } from "@/src/contexts/LessonTaskVerificationContext";

const InstallMetaMask = () => {
    const lessonTask = useLessonTaskVerification();
    const [status, setStatus] = useState<"pending" | "success" | "failed" | "idle">("idle");
    const [isLoading, setIsLoading] = useState(false);

    const verifyMetaMaskInstallation = () => {
        setIsLoading(true);
        setStatus("pending");
        const isMetaMaskInstalled = typeof (window as any).ethereum !== 'undefined' && (window as any).ethereum.isMetaMask;

        setTimeout(() => {
            if (isMetaMaskInstalled) {
                setStatus("success");
                lessonTask?.markTaskVerified();
            } else {
                setStatus("failed");
            }
            setIsLoading(false);
        }, 1000);
    }

    return (
        <div className="bg-gradient-to-br from-slate-100 via-sky-50 to-emerald-50 p-6">
            <div className="max-w-md mx-auto">
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-sky-100 to-emerald-100 px-6 py-8 border-b border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-sky-200/50 rounded-lg">
                                <Download className="w-5 h-5 text-sky-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">Install MetaMask</h1>
                        </div>
                        <p className="text-slate-600 text-sm ml-11">Verify installation status</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <p className="text-sm text-slate-600 text-center">Check if MetaMask is installed on your browser</p>

                        <button
                            onClick={verifyMetaMaskInstallation}
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
                                    <Download className="w-5 h-5" />
                                    <span>Verify Installation</span>
                                </>
                            )}
                        </button>

                        {status === "success" && (
                            <div className="bg-gradient-to-r from-emerald-100/80 to-teal-100/80 border border-emerald-300 rounded-xl p-4 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-emerald-800">MetaMask Installed!</p>
                                        <p className="text-emerald-700 text-sm mt-1">You're ready to use Web3 features.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === "failed" && (
                            <div className="bg-gradient-to-r from-rose-100/80 to-orange-100/80 border border-rose-300 rounded-xl p-4 animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-rose-800">Not Installed</p>
                                        <p className="text-rose-700 text-sm mt-1">Please install MetaMask from the official website.</p>
                                        <a
                                            href="https://metamask.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-2 px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded hover:bg-rose-700 transition"
                                        >
                                            Get MetaMask
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-slate-100/50 to-sky-100/50 px-6 py-4 border-t border-slate-200">
                        <p className="text-xs text-slate-600 text-center">
                            💡 MetaMask is required to interact with the blockchain
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InstallMetaMask