import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { authAPI } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [loading, setLoading] = useState(true);

    const disconnectWallet = () => {
        setWalletAddress(null);
        setProvider(null);
        setSigner(null);
        localStorage.removeItem('walletAddress');
    };

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else if (accounts[0] !== walletAddress) {
            setWalletAddress(accounts[0]);
            localStorage.setItem('walletAddress', accounts[0]);
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            const savedWallet = localStorage.getItem('walletAddress');

            if (savedWallet) {
                setWalletAddress(savedWallet);
            }

            if (token) {
                try {
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to load user', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', () => window.location.reload());
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const login = async (email, password, role) => {
        try {
            setLoading(true);
            const data = await authAPI.login(email, password, role);

            localStorage.setItem('token', data.token);
            setUser(data.user);
            setLoading(false);

            return { success: true };
        } catch (error) {
            setLoading(false);
            const msg = error.response?.data?.msg || error.response?.data?.errors?.[0]?.msg || 'Login failed';
            return { success: false, error: msg };
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const data = await authAPI.register(userData);

            localStorage.setItem('token', data.token);
            setUser(data.user);
            setLoading(false);
            return { success: true };
        } catch (error) {
            setLoading(false);
            const msg = error.response?.data?.msg || error.response?.data?.errors?.[0]?.msg || 'Registration failed';
            return { success: false, error: msg };
        }
    };

    const logout = () => {
        setUser(null);
        setWalletAddress(null);
        setProvider(null);
        setSigner(null);
        localStorage.removeItem('token');
        localStorage.removeItem('walletAddress');
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to connect your wallet');
            }

            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await web3Provider.send('eth_requestAccounts', []);
            const web3Signer = await web3Provider.getSigner();

            setProvider(web3Provider);
            setSigner(web3Signer);
            setWalletAddress(accounts[0]);
            localStorage.setItem('walletAddress', accounts[0]);

            return { success: true, address: accounts[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        walletAddress,
        provider,
        signer,
        loading,
        login,
        register,
        logout,
        connectWallet,
        disconnectWallet,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
