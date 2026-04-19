"use client"

import { pixelify_sans } from '@/app/fonts';
import { Name } from '@coinbase/onchainkit/identity';
import { WalletDefault } from '@coinbase/onchainkit/wallet';
import { useEffect, useRef, useState } from 'react';
import { IoSend } from "react-icons/io5";
import { FiUpload, FiX, FiCheck, FiLoader } from "react-icons/fi";
import { base } from 'viem/chains';
import { useSignMessage, useAccount } from 'wagmi';

interface ChatMessage {
    id: string;
    message: string;
    timestamp: Date;
    address?: `0x${string}`;
    characterName: string;
}

interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    userId?: string;
}

const characterColors: { [key: string]: string } = {
    'Eric': 'text-emerald-600',
    'Harper': 'text-purple-600',
    'Rishi': 'text-amber-600',
    'Yasmin': 'text-rose-600',
    'You': 'text-blue-600'
};

const Chat = ({ messages, onSendMessage, disabled = false, userId }: ChatProps) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState('');
    const [uploadedContract, setUploadedContract] = useState<{ fileId: string; contractName: string } | null>(null);
    const [signingStatus, setSigningStatus] = useState<'idle' | 'waiting' | 'error'>('idle');
    const [pendingMessage, setPendingMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        // No contract pending — just send normally
        if (!uploadedContract) {
            onSendMessage(message.trim());
            setMessage('');
            return;
        }

        // Contract pending — trigger real MetaMask signature
        const msgToSend = message.trim();
        setPendingMessage(msgToSend);
        setSigningStatus('waiting');

        try {
            await signMessageAsync({
                message: `Authorize deployment of ${uploadedContract.contractName} on HeLa Testnet\n\nFile ID: ${uploadedContract.fileId}\nTimestamp: ${Date.now()}`
            });

            // Signature succeeded — inject fileId and send to bot
            const msgWithContext = `${msgToSend} [fileId: ${uploadedContract.fileId}]`;
            onSendMessage(msgWithContext);
            setMessage('');
            setUploadedContract(null);
            setUploadStatus('idle');
            setUploadMessage('');
        } catch (err: any) {
            // User rejected or MetaMask not connected
            const rejected = err?.message?.toLowerCase().includes('rejected') || err?.message?.toLowerCase().includes('denied');
            setUploadMessage(rejected ? 'Signature rejected. Deployment cancelled.' : 'MetaMask error: ' + err.message);
            setUploadStatus('error');
            setTimeout(() => { setUploadStatus('success'); setUploadMessage(`${uploadedContract.contractName} compiled! Now type a message and hit send to deploy.`); }, 3000);
        } finally {
            setSigningStatus('idle');
            setPendingMessage('');
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.sol')) {
            setUploadStatus('error');
            setUploadMessage('Please select a .sol file');
            setTimeout(() => setUploadStatus('idle'), 3000);
            return;
        }

        if (!userId) {
            setUploadStatus('error');
            setUploadMessage('User not authenticated');
            setTimeout(() => setUploadStatus('idle'), 3000);
            return;
        }

        setUploadStatus('uploading');

        try {
            const sourceCode = await file.text();
            const contractName = file.name.replace('.sol', '');
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

            const response = await fetch(`${backendUrl}/api/contracts/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, fileName: file.name, sourceCode, contractName })
            });

            const result = await response.json();

            if (result.success) {
                setUploadStatus('success');
                setUploadMessage(`${contractName} compiled! Now type a message and hit send to deploy.`);
                setUploadedContract({ fileId: result.data.fileId, contractName: result.data.contractName });
            } else {
                setUploadStatus('error');
                setUploadMessage(result.error || 'Upload failed');
                setTimeout(() => setUploadStatus('idle'), 5000);
            }
        } catch (error: any) {
            setUploadStatus('error');
            setUploadMessage(`Network error: ${error.message}`);
            setTimeout(() => setUploadStatus('idle'), 5000);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`${pixelify_sans.className}
            transition-all duration-300 flex-1 md:flex-none
            md:w-full h-full max-h-screen md:relative
            ${isExpanded ? 'fixed inset-0 z-50 bg-card/95' : 'relative bg-card/80 backdrop-blur-sm rounded-lg h-14 md:h-full'}
        `}>
            <div className="flex flex-col h-full">
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-4 border-b border-gray-200 cursor-pointer flex items-center gap-3 md:cursor-default h-14 shrink-0"
                >
                    <div className="flex-1 flex items-center gap-2">
                        <h2 className="font-semibold tracking-tight text-2xl text-blue-900 flex items-center gap-2">
                            Chat History
                            <div className="w-4 h-4 text-xs"><WalletDefault /></div>
                        </h2>
                        <button className="md:hidden ml-auto">{isExpanded ? '✕' : '↑'}</button>
                    </div>
                </div>

                <div
                    ref={chatContainerRef}
                    className={`overflow-y-auto p-4 space-y-4 flex-1 transition-all duration-300
                        ${isExpanded ? 'h-[calc(100vh-8rem)]' : 'h-0 md:h-[calc(100%-8rem)]'}
                        ${!isExpanded && 'md:opacity-100 opacity-0'}
                    `}
                >
                    {messages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`font-semibold text-sm ${characterColors[msg.characterName] || 'text-gray-600'}`}>
                                    {msg.characterName} {msg.address && <Name address={msg.address} chain={base} />}
                                </span>
                                <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-gray-700 break-words">{msg.message}</p>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 space-y-2">
                    {/* Upload status / contract badge */}
                    {uploadStatus !== 'idle' && (
                        <div className={`p-2 rounded text-xs flex items-center gap-2 ${
                            uploadStatus === 'success' ? 'bg-green-100 text-green-800' :
                            uploadStatus === 'error'   ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {uploadStatus === 'uploading' && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                            {uploadStatus === 'success' && <FiCheck size={14} />}
                            {uploadStatus === 'error'   && <FiX size={14} />}
                            <span className="flex-1">{uploadMessage}</span>
                            {uploadedContract && (
                                <button type="button" onClick={() => { setUploadedContract(null); setUploadStatus('idle'); }}>
                                    <FiX size={14} />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={disabled}
                            placeholder={uploadedContract ? `Tell Rishi to deploy ${uploadedContract.contractName}...` : 'Just ask...'}
                            className="flex-1 px-4 py-2 rounded-lg bg-transparent border border-navy-600/20 text-black placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-300"
                        />

                        <input ref={fileInputRef} type="file" accept=".sol" onChange={handleFileSelect} className="hidden" id="contract-upload" />
                        <label
                            htmlFor="contract-upload"
                            className={`p-2 rounded-lg cursor-pointer transition-colors
                                ${uploadStatus === 'uploading' ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white'}
                            `}
                            title="Upload Solidity contract (.sol)"
                        >
                            {uploadStatus === 'uploading'
                                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <FiUpload size={20} />
                            }
                        </label>

                        <button
                            type="submit"
                            disabled={disabled || !message.trim() || signingStatus === 'waiting'}
                            className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-navy-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {signingStatus === 'waiting'
                                ? <FiLoader size={20} className="animate-spin" />
                                : <IoSend size={20} />
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Chat;
