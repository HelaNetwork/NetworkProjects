"use client"

import React, { useState } from 'react';
import { IoSend } from "react-icons/io5";

interface ChatBarProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
}

const ChatBar: React.FC<ChatBarProps> = ({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[90%] flex gap-2 items-center z-20"
        >
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={disabled}
                placeholder="Just ask..."
                className="flex-1 px-4 py-2 rounded-lg bg-transparent 
                          border border-navy-600/20 text-black placeholder-navy-400
                          focus:outline-none focus:ring-2 focus:ring-navy-300"
            />
            <button
                type="submit"
                disabled={disabled || !message.trim()}
                className="bg-primary text-white shadow hover:bg-primary/90 
                          h-9 w-9 rounded-lg flex items-center justify-center
                          disabled:bg-primary/30 disabled:cursor-not-allowed"
            >
                <IoSend size={20} />
            </button>
        </form>
    );
};

export default ChatBar;
