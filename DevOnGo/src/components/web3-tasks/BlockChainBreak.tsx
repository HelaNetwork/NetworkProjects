import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ethers } from 'ethers';

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
        <div className="flex scale-75 flex-col items-center justify-center p-8 w-full bg-[#F8FAFC] text-slate-900 overflow-hidden relative">
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
                            {index > 0 && (
                                <div className="relative h-12 w-1 lg:h-1 lg:w-12 flex items-center justify-center">
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
                            <motion.div
                                layout
                                animate={{
                                    y: isInvalid ? [0, -8, 0] : 0,
                                    borderColor: isInvalid ? '#ef4444' : '#e2e8f0',
                                    scale: isInvalid ? 1.02 : 1,
                                }}
                                className={`relative w-50 lg:w-50 p-6 rounded-2xl border-2 bg-white/70 backdrop-blur-sm transition-all duration-500 ${isInvalid
                                    ? 'shadow-[0_20px_50px_rgba(239,68,68,0.1)] border-red-500'
                                    : 'shadow-[0_20px_50px_rgba(148,163,184,0.1)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:border-indigo-200'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isInvalid ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            #{block.id}
                                        </div>
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full ${isInvalid ? 'bg-red-500 animate-pulse ring-4 ring-red-100' : 'bg-emerald-500 ring-4 ring-emerald-100'}`} />
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-wider">Transaction Data</label>
                                        <input
                                            type="text"
                                            value={block.data}
                                            onChange={(e) => handleDataChange(block.id, e.target.value)}
                                            className={`w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold transition-all outline-none ${isInvalid ? 'focus:border-red-400 text-red-700' : 'focus:border-indigo-500 text-slate-700'
                                                }`}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default BlockChainBreak;
