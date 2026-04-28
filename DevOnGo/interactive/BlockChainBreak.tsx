import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ethers } from 'ethers';
import { useLessonTaskVerification } from '@/src/contexts/LessonTaskVerificationContext';

const TextHack = ({ text, className }: { text: string; className?: string }) => {
    const [display, setDisplay] = useState(text);
    const chars = 'ABCDEF0123456789';
    const iteration = useRef(0);

    useEffect(() => {
        iteration.current = 0;
        const interval = setInterval(() => {
            setDisplay(() =>
                text.split('').map((_, index) => {
                    if (index < iteration.current) return text[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('')
            );
            if (iteration.current >= text.length) clearInterval(interval);
            iteration.current += 1 / 3;
        }, 20);
        return () => clearInterval(interval);
    }, [text]);

    return <span className={className}>{display}</span>;
};

interface Block {
    id: number;
    data: string;
    prevHash: string;
    hash: string;
}

const BlockChainBreak = () => {
    const lessonTask = useLessonTaskVerification();
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [invalidIndex, setInvalidIndex] = useState<number | null>(null);

    useEffect(() => {
        const initialBlocks: Block[] = [];
        let prevHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
        for (let i = 0; i < 3; i++) {
            const data = `Transaction Data ${i + 1}`;
            const hash = ethers.id(i + prevHash + data);
            initialBlocks.push({ id: i, data, prevHash, hash });
            prevHash = hash;
        }
        setBlocks(initialBlocks);
    }, []);

    const handleDataChange = (id: number, newData: string) => {
        setBlocks(prev => {
            const nextBlocks = [...prev];
            const blockIndex = nextBlocks.findIndex(b => b.id === id);
            if (blockIndex === -1) return prev;
            nextBlocks[blockIndex].data = newData;
            nextBlocks[blockIndex].hash = ethers.id(id + nextBlocks[blockIndex].prevHash + newData);

            let firstBreak = null;
            for (let i = 1; i < nextBlocks.length; i++) {
                if (nextBlocks[i].prevHash !== nextBlocks[i - 1].hash) {
                    firstBreak = i;
                    break;
                }
            }
            setInvalidIndex(firstBreak);
            return nextBlocks;
        });
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 w-full bg-[#F8FAFC] text-slate-900 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]" />
            </div>

            {/* Background Grid Accent */}
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="relative z-10 flex flex-col mb-12 text-center max-w-2xl px-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                    Blockchain <span className="text-indigo-600">Integrity</span>
                </h1>
                <p className="text-slate-500 font-medium">
                    Modify any block's data to see how the cryptographic chain breaks instantly.
                    The security of blockchain lies in its immutable hash linking.
                </p>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0 w-full max-w-7xl px-4">
                {blocks.map((block, index) => {
                    const isInvalid = invalidIndex !== null && index >= invalidIndex;

                    return (
                        <React.Fragment key={block.id}>
                            {/* Connector Line */}
                            {index > 0 && (
                                <div className="relative h-12 w-1 lg:h-1 lg:w-20 flex items-center justify-center">
                                    <motion.div
                                        className={`w-full h-full transition-colors duration-500 ${isInvalid ? 'bg-red-200' : 'bg-indigo-500'}`}
                                        animate={{ height: isInvalid ? '100%' : '2px', width: isInvalid ? '2px' : '100%' }}
                                    />
                                    {isInvalid && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute bg-white border border-red-200 text-red-600 shadow-sm text-[9px] font-black px-1.5 py-0.5 rounded-sm transform rotate-90 lg:rotate-0"
                                        >
                                            BROKEN
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Block Card */}
                            <motion.div
                                layout
                                animate={{
                                    y: isInvalid ? [0, -8, 0] : 0,
                                    borderColor: isInvalid ? '#ef4444' : '#e2e8f0',
                                    scale: isInvalid ? 1.02 : 1,
                                }}
                                className={`relative w-full lg:w-80 p-6 rounded-2xl border-2 bg-white/70 backdrop-blur-sm transition-all duration-500 ${isInvalid
                                    ? 'shadow-[0_20px_50px_rgba(239,68,68,0.1)] border-red-500'
                                    : 'shadow-[0_20px_50px_rgba(148,163,184,0.1)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:border-indigo-200'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isInvalid ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            #{block.id}
                                        </div>
                                        <span className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-widest">Block Unit</span>
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full ${isInvalid ? 'bg-red-500 animate-pulse ring-4 ring-red-100' : 'bg-emerald-500 ring-4 ring-emerald-100'}`} />
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-wider">Transaction Data</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={block.data}
                                                onChange={(e) => handleDataChange(block.id, e.target.value)}
                                                className={`w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold transition-all outline-none ${isInvalid ? 'focus:border-red-400 text-red-700' : 'focus:border-indigo-500 text-slate-700'
                                                    }`}
                                            />
                                            <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${isInvalid ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-indigo-500 shadow-[0_0_8px_#6366f1]'} group-focus-within:w-full w-0`} />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 space-y-4">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <div className="w-1 h-3 bg-slate-300 rounded-full" />
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Previous Hash</label>
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400 truncate bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-100 italic">
                                                {block.prevHash}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1 h-3 rounded-full ${isInvalid ? 'bg-red-500' : 'bg-indigo-500'}`} />
                                                    <label className={`text-[9px] font-bold uppercase tracking-wider ${isInvalid ? 'text-red-500' : 'text-indigo-600'}`}>Current Hash</label>
                                                </div>
                                                {isInvalid && <span className="text-[8px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full uppercase">Corrupted</span>}
                                            </div>
                                            <div className={`text-[10px] font-mono p-3 rounded-xl border transition-all duration-300 break-all leading-relaxed ${isInvalid
                                                ? 'bg-red-50 border-red-100 text-red-600 shadow-inner'
                                                : 'bg-indigo-50/30 border-indigo-100/50 text-indigo-700'
                                                }`}>
                                                <TextHack text={block.hash.substring(0, 32)} />
                                                <span className="opacity-40">...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="h-32 flex items-center justify-center relative z-10 w-full">
                <AnimatePresence mode="wait">
                    {invalidIndex !== null ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center"
                        >
                            <p className="text-red-500 font-bold mb-6 flex items-center gap-3 bg-red-50 px-6 py-2 rounded-full border border-red-100 shadow-sm">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                Integrity Compromised at Block #{invalidIndex}
                            </p>
                            <button
                                onClick={() => {
                                    let prevHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
                                    setBlocks(blocks.map((b, i) => {
                                        const hash = ethers.id(i + prevHash + b.data);
                                        const updated = { ...b, prevHash, hash };
                                        prevHash = hash;
                                        return updated;
                                    }));
                                    setInvalidIndex(null);
                                    lessonTask?.markTaskVerified();
                                }}
                                className="group relative px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 hover:shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:scale-95"
                            >
                                <span className="relative z-10">Re-Hash Network</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-slate-400 font-medium text-sm flex items-center gap-2"
                        >
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            All blocks verified. System secure.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BlockChainBreak;