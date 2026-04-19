import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [address, setAddress] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [provider, setProvider] = useState(null);

    const connect = async () => {
        if (!window.ethereum) {
            alert("MetaMask not found. Please install it.");
            return;
        }
        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            await browserProvider.send("eth_requestAccounts", []);
            const signer = await browserProvider.getSigner();
            const addr = await signer.getAddress();
            
            setProvider(browserProvider);
            setAddress(addr);
            setIsConnected(true);
        } catch (error) {
            console.error("Wallet connection failed:", error);
        }
    };

    const disconnect = () => {
        setAddress(null);
        setIsConnected(false);
        setProvider(null);
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
                if (accounts.length > 0) {
                    connect();
                }
            }).catch(console.error);

            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) disconnect();
                else connect();
            });
        }
    }, []);

    return (
        <Web3Context.Provider value={{ address, isConnected, provider, connect, disconnect }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3Context = () => useContext(Web3Context);
