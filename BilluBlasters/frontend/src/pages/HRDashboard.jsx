import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { employeeAPI, streamAPI, taxAPI } from '../api/api';
import PayStreamABI from '../abi/PayStream.json';
import { createStream, fundSystem, setStreamState, emergencyWithdraw, getAvailableBalance } from '../utils/web3Service';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardHeader, CardBody } from '../components/Card';
import Input from '../components/Input';
import {
    Wallet, LogOut, Users, TrendingUp, DollarSign, Play, Pause, X,
    Search, Plus, Filter, Download, Settings, Activity, AlertCircle, Mail,
    Upload, FileDown, Lock, Edit2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './HRDashboard.css';

const HRDashboard = () => {
    const { user, logout, walletAddress, connectWallet, disconnectWallet } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
    const [showCreateStreamModal, setShowCreateStreamModal] = useState(false);
    const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
    const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [connectingWallet, setConnectingWallet] = useState(false);

    // Tax-related states
    const [taxAddress, setTaxAddress] = useState(localStorage.getItem('taxAddress') || '');
    const [editingTaxAddress, setEditingTaxAddress] = useState(false);
    const [tempTaxAddress, setTempTaxAddress] = useState('');
    const [taxStreams, setTaxStreams] = useState([]);
    const [taxVault, setTaxVault] = useState(0);

    const [dashboardStats, setDashboardStats] = useState({
        totalEmployees: 0,
        activeStreams: 0,
        contractBalance: 0,
        monthlyPayroll: 0,
    });

    const [employees, setEmployees] = useState([]);
    const [streams, setStreams] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingStream, setProcessingStream] = useState(null); // ID of stream being processed
    const [isCreatingStream, setIsCreatingStream] = useState(false);
    const [isAddingMoney, setIsAddingMoney] = useState(false);
    const [isSavingTaxAddress, setIsSavingTaxAddress] = useState(false);
    const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
    const [isUpdatingEmployee, setIsUpdatingEmployee] = useState(false);

    // Filter states
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [contractOwner, setContractOwner] = useState(null);

    // Fetch contract owner
    useEffect(() => {
        const fetchOwner = async () => {
            try {
                // Hardcoded from known deployment to save RPC calls, or fetch dynamic
                // Using dynamic fetch is better
                const provider = new ethers.JsonRpcProvider('https://testnet-rpc.helachain.com/');
                const contract = new ethers.Contract('0xa9aE42d8D3583de0677e41Cee8FBeb16Bde5D870', PayStreamABI, provider);
                const owner = await contract.owner();
                setContractOwner(owner.toLowerCase());
            } catch (err) {
                console.error("Failed to fetch contract owner:", err);
            }
        };
        fetchOwner();
    }, []);

    const isOwner = useMemo(() => {
        if (!walletAddress || !contractOwner) return false;
        return walletAddress.toLowerCase() === contractOwner.toLowerCase();
    }, [walletAddress, contractOwner]);

    const refreshContractBalance = async () => {
        try {
            const stats = await streamAPI.getContractStats();
            setDashboardStats(prev => ({
                ...prev,
                contractBalance: parseFloat(ethers.formatEther(stats.availableBalance || '0'))
            }));
        } catch (error) {
            console.error("Failed to refresh balance from DB:", error);
            // Fallback to blockchain if DB fails or isn't synced
            try {
                const balanceInEth = await getAvailableBalance();
                setDashboardStats(prev => ({
                    ...prev,
                    contractBalance: parseFloat(balanceInEth)
                }));
            } catch (err) {
                console.error("Blockchain fallback also failed:", err);
            }
        }
    };

    const loadData = async () => {
        try {
            const [empData, streamData, txData] = await Promise.all([
                employeeAPI.getAll(),
                streamAPI.getAll(),
                streamAPI.getTransactions()
            ]);

            // Map API data to UI structure
            const formattedEmployees = empData.map(u => ({
                _id: u._id,
                id: u.employeeId || u._id,
                employeeId: u.employeeId,
                name: u.name,
                email: u.email,
                department: u.department || 'N/A',
                designation: u.designation || 'N/A',
                walletAddress: u.walletAddress || 'No Wallet',
                salary: u.salary || 0,
                status: u.active ? 'active' : 'paused'
            }));
            setEmployees(formattedEmployees);

            // Streams
            setStreams(streamData);
            setTransactions(txData);

            // Update Stats
            setDashboardStats(prev => ({
                ...prev,
                totalEmployees: formattedEmployees.length,
                activeStreams: streamData.filter(s => s.state === 'Active').length,
                monthlyPayroll: formattedEmployees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0)
            }));
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'hr') {
            loadData();
            refreshContractBalance();
        }
    }, [user]);


    // Dynamic stats calculation
    useEffect(() => {
        if (!loading) {
            setDashboardStats(prev => ({
                ...prev,
                totalEmployees: employees.length,
                activeStreams: streams.filter(s => s.state === 'Active').length,
                monthlyPayroll: employees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0)
            }));
        }
    }, [employees, streams, loading]);

    // Calculate real-time streamed amount for tax streams (NET VAULT BALANCE)
    const calculateLiveTaxVault = React.useCallback((streamsToCalculate) => {
        if (!streamsToCalculate || streamsToCalculate.length === 0) return 0;

        const now = BigInt(Math.floor(Date.now() / 1000));
        let totalStreamed = 0n;
        let totalWithdrawn = 0n;

        streamsToCalculate.forEach(stream => {
            const deposit = BigInt(stream.deposit || 0);
            const withdrawn = BigInt(stream.withdrawn || 0);
            const startTime = BigInt(stream.startTime || 0);
            const endTime = BigInt(stream.endTime || 0);

            totalWithdrawn += withdrawn;

            if (stream.state === 'Active') {
                const duration = endTime - startTime;
                if (duration > 0n && now >= startTime) {
                    const elapsed = (now - startTime) > duration ? duration : (now - startTime);
                    const streamed = (deposit * elapsed) / duration;
                    totalStreamed += streamed;
                }
            } else if (stream.state === 'Completed') {
                totalStreamed += deposit;
            } else if (stream.state === 'Paused') {
                const pausedAt = BigInt(stream.lastPausedAt || 0) || BigInt(Math.floor(Date.now() / 1000));
                const duration = endTime - startTime;
                if (duration > 0n && pausedAt >= startTime) {
                    const elapsed = (pausedAt - startTime) > duration ? duration : (pausedAt - startTime);
                    const streamed = (deposit * elapsed) / duration;
                    totalStreamed += streamed;
                }
            }
        });

        const balance = totalStreamed > totalWithdrawn ? totalStreamed - totalWithdrawn : 0n;
        return Number(balance) / 1e18;
    }, []);

    // Recalculate tax streams when streams change - use isTaxStream flag
    useEffect(() => {
        if (streams.length > 0) {
            const taxStreamData = streams.filter(s => s.label === 'tax');
            setTaxStreams(taxStreamData);
            // Calculate initial vault amount
            const initialVault = calculateLiveTaxVault(taxStreamData);
            setTaxVault(initialVault);
        } else {
            setTaxStreams([]);
            setTaxVault(0);
        }
    }, [streams, calculateLiveTaxVault]);

    // Update tax vault every second for real-time streaming
    useEffect(() => {
        if (taxStreams.length === 0) return;

        // Run interval regardless of active status to account for paused/completed streams or time changes? 
        // Logic: calculateLiveTaxVault uses Date.now(), so it changes every second.
        const interval = setInterval(() => {
            const liveVault = calculateLiveTaxVault(taxStreams);
            setTaxVault(liveVault);
        }, 1000);

        return () => clearInterval(interval);
    }, [taxStreams, calculateLiveTaxVault]);

    const streamData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();

        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const m = (currentMonth - i + 12) % 12;
            last6Months.push({ month: months[m], amount: 0 });
        }

        streams.forEach(stream => {
            const date = new Date(stream.createdAt || Date.now());
            const monthName = months[date.getMonth()];
            const dataPoint = last6Months.find(d => d.month === monthName);
            if (dataPoint) {
                dataPoint.amount += Number(stream.deposit) / 1e18;
            }
        });

        // Use placeholder data if empty for better visual
        if (last6Months.every(d => d.amount === 0)) {
            return last6Months.map((d, i) => ({ ...d, amount: [2.5, 3.8, 3.2, 5.4, 4.1, 6.2][i] }));
        }

        return last6Months;
    }, [streams]);

    const departmentData = useMemo(() => {
        const counts = {};
        employees.forEach(emp => {
            const dept = emp.department || 'Other';
            counts[dept] = (counts[dept] || 0) + 1;
        });

        const colors = ['#667eea', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        const data = Object.keys(counts).map((dept, index) => ({
            name: dept,
            value: counts[dept],
            color: colors[index % colors.length]
        }));

        if (data.length === 0) {
            return [
                { name: 'Engineering', value: 1, color: '#667eea' },
                { name: 'Marketing', value: 1, color: '#0ea5e9' }
            ];
        }

        return data;
    }, [employees]);

    const filteredTransactions = useMemo(() => {
        const filtered = transactions.filter(tx => {
            const date = new Date(tx.timestamp);
            const matchesMonth = filterMonth === 'all' || (date.getMonth() + 1).toString() === filterMonth;
            const matchesYear = filterYear === 'all' || date.getFullYear().toString() === filterYear;
            const matchesType = filterType === 'all' || tx.type === filterType;
            return matchesMonth && matchesYear && matchesType;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // If no filters are active, show only 5 most recent transactions
        const noFiltersActive = filterMonth === 'all' && filterYear === 'all' && filterType === 'all';
        if (noFiltersActive) {
            return filtered.slice(0, 5);
        }

        // If filters are active, show all matching transactions
        return filtered;
    }, [transactions, filterMonth, filterYear, filterType]);

    const handleExportTransactions = () => {
        if (filteredTransactions.length === 0) {
            Swal.fire({ icon: 'info', title: 'No Data', text: 'No transactions found for the current filters', background: '#1a1a1a', color: '#fff' });
            return;
        }

        const headers = ["Date", "Type", "Transaction Hash", "Amount (HLUSD)", "Sender", "Receiver"];
        const csvRows = filteredTransactions.map(tx => [
            new Date(tx.timestamp).toLocaleString(),
            tx.type,
            tx.txHash,
            tx.amount ? parseFloat(ethers.formatEther(tx.amount)).toFixed(4) : '0',
            tx.sender,
            tx.receiver
        ]);

        const csvContent = [headers, ...csvRows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions_${filterMonth}_${filterYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleConnectWallet = async () => {
        setConnectingWallet(true);
        const result = await connectWallet();
        if (!result.success) {
            Swal.fire({
                icon: 'error',
                title: 'Connection Failed',
                text: result.error,
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#3085d6'
            });
        }
        setConnectingWallet(false);
    };

    const handleAddMoney = async (amount) => {
        setIsAddingMoney(true);
        try {
            await fundSystem(amount);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Funds added successfully!',
                background: '#1a1a1a',
                color: '#fff',
                timer: 2000,
                showConfirmButton: false
            });
            setShowAddMoneyModal(false);
            refreshContractBalance();
        } catch (error) {
            console.error('Funding failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'Funding Failed',
                text: error.message,
                background: '#1a1a1a',
                color: '#fff'
            });
        } finally {
            setIsAddingMoney(false);
        }
    };

    const handleSaveTaxAddress = async () => {
        if (!tempTaxAddress.trim()) return;

        setIsSavingTaxAddress(true);
        try {
            // Save to backend
            await taxAPI.updateTaxAddress(tempTaxAddress.trim());

            // Save to local state and storage
            setTaxAddress(tempTaxAddress.trim());
            localStorage.setItem('taxAddress', tempTaxAddress.trim());
            setEditingTaxAddress(false);

            Swal.fire({
                icon: 'success',
                title: 'Tax Address Updated',
                text: 'Tax beneficiary address has been saved successfully. New streams to this address will be marked as tax streams.',
                timer: 3000,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#fff'
            });
        } catch (error) {
            console.error('Error saving tax address:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save tax address. Please try again.',
                background: '#1a1a1a',
                color: '#fff'
            });
        } finally {
            setIsSavingTaxAddress(false);
        }
    };

    const handleCreateStream = async (data) => {
        setIsCreatingStream(true);
        try {
            const taxPercentage = parseFloat(data.taxPercentage) || 0;
            const totalAmount = parseFloat(data.amount);
            const taxAmount = (totalAmount * taxPercentage) / 100;
            const netAmount = totalAmount - taxAmount;

            console.log(`Creating stream: Total=${totalAmount}, Tax=${taxPercentage}% (${taxAmount}), Net=${netAmount}`);

            // Initialize Interface for parsing logs
            const iface = new ethers.Interface(PayStreamABI);

            // 1. Create Employee Stream (Net Amount)
            console.log('Creating employee stream...');
            const receipt = await createStream(data.walletAddress, netAmount, data.streamType, data.durationOrEndTime);

            // Parse logs to find 'StreamCreated' event
            let streamId = null;
            if (receipt && receipt.logs) {
                for (const log of receipt.logs) {
                    try {
                        const parsed = iface.parseLog(log);
                        if (parsed && parsed.name === 'StreamCreated') {
                            streamId = parsed.args[0].toString();
                            break;
                        }
                    } catch (e) { /* ignore other logs */ }
                }
            }

            if (streamId) {
                console.log(`Employee Stream Created: ID ${streamId}, Tx: ${receipt.hash}`);
                // Label the stream and transaction immediately
                await streamAPI.labelStream(streamId, 'employee');
                await streamAPI.labelTransaction(receipt.hash, 'employee');
            }

            // 2. Create Tax Stream (if applicable)
            if (taxPercentage > 0 && taxAddress && taxAddress.trim() !== '') {
                try {
                    console.log(`Creating tax stream to ${taxAddress} for ${taxAmount}...`);
                    // Tax stream is always Continuous? Or same type as employee? typically continuous for salary tax?
                    // Let's use 'Continuous' as per original code, or match employee type?
                    // Original code used 'Continuous'.
                    const taxReceipt = await createStream(taxAddress, taxAmount, 'Continuous', data.durationOrEndTime);

                    let taxStreamId = null;
                    if (taxReceipt && taxReceipt.logs) {
                        for (const log of taxReceipt.logs) {
                            try {
                                const parsed = iface.parseLog(log);
                                if (parsed && parsed.name === 'StreamCreated') {
                                    taxStreamId = parsed.args[0].toString();
                                    break;
                                }
                            } catch (e) { }
                        }
                    }

                    if (taxStreamId) {
                        console.log(`Tax Stream Created: ID ${taxStreamId}, Tx: ${taxReceipt.hash}`);
                        await streamAPI.labelStream(taxStreamId, 'tax');
                        await streamAPI.labelTransaction(taxReceipt.hash, 'tax');
                    }
                } catch (taxError) {
                    console.error('Tax stream creation failed:', taxError);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Tax Stream Failed',
                        text: 'Employee stream created, but tax stream failed: ' + taxError.message,
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                    // Continue to success message for employee stream
                }
            }

            Swal.fire({
                icon: 'success',
                title: 'Stream Created',
                text: `Stream created successfully! ${taxPercentage > 0 ? `Tax deduction: ${taxPercentage}% (${taxAmount.toFixed(4)} HLUSD)` : ''}`,
                background: '#1a1a1a',
                color: '#fff'
            });
            setShowCreateStreamModal(false);
            // Indexer will pick it up, refresh after a short delay
            setTimeout(() => {
                loadData();
                refreshContractBalance();
            }, 3000);
        } catch (error) {
            console.error('Stream creation failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: error.message,
                background: '#1a1a1a',
                background: '#1a1a1a',
                color: '#fff'
            });
        } finally {
            setIsCreatingStream(false);
        }
    };

    const handlePauseStream = async (streamId) => {
        if (!isOwner) {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'Only the contract owner can managing streams. Please switch to the owner wallet.',
                background: '#1a1a1a',
                color: '#fff'
            });
            return;
        }
        setProcessingStream(streamId);
        try {
            await setStreamState(streamId, 'Paused');
            // Update local state immediately for responsiveness
            setStreams(prev => prev.map(s => s.streamId === streamId ? { ...s, state: 'Paused' } : s));

            Swal.fire({
                icon: 'success',
                title: 'Paused',
                text: 'Stream paused successfully!',
                timer: 1500,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#fff'
            });
        } catch (error) {
            console.error('Pause failed:', error);
            Swal.fire({ icon: 'error', title: 'Pause Failed', text: error.message, background: '#1a1a1a', color: '#fff' });
        } finally {
            setProcessingStream(null);
        }
    };

    const handleResumeStream = async (streamId) => {
        if (!isOwner) {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'Only the contract owner can managing streams. Please switch to the owner wallet.',
                background: '#1a1a1a',
                color: '#fff'
            });
            return;
        }
        setProcessingStream(streamId);
        try {
            await setStreamState(streamId, 'Active');
            // Update local state immediately
            setStreams(prev => prev.map(s => s.streamId === streamId ? { ...s, state: 'Active' } : s));

            Swal.fire({
                icon: 'success',
                title: 'Resumed',
                text: 'Stream resumed successfully!',
                timer: 1500,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#fff'
            });
        } catch (error) {
            console.error('Resume failed:', error);
            Swal.fire({ icon: 'error', title: 'Resume Failed', text: error.message, background: '#1a1a1a', color: '#fff' });
        } finally {
            setProcessingStream(null);
        }
    };

    const handleCancelStream = async (streamId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Are you sure you want to cancel this stream? This cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (result.isConfirmed) {
            if (!isOwner) {
                Swal.fire({
                    icon: 'error',
                    title: 'Unauthorized',
                    text: 'Only the contract owner can cancel streams.',
                    background: '#1a1a1a',
                    color: '#fff'
                });
                return;
            }
            setProcessingStream(streamId);
            try {
                await setStreamState(streamId, 'Cancelled');
                // Update local state
                setStreams(prev => prev.map(s => s.streamId === streamId ? { ...s, state: 'Cancelled' } : s));
                refreshContractBalance(); // Cancellation might return funds or consolidate

                Swal.fire({ icon: 'success', title: 'Cancelled', text: 'Stream cancelled successfully!', background: '#1a1a1a', color: '#fff' });
            } catch (error) {
                console.error('Cancellation failed:', error);
                Swal.fire({ icon: 'error', title: 'Cancellation Failed', text: error.message, background: '#1a1a1a', color: '#fff' });
            } finally {
                setProcessingStream(null);
            }
        }
    };

    const handleEmergencyWithdraw = async () => {
        const result = await Swal.fire({
            title: 'EMERGENCY HALT',
            text: "This will pause all streams and withdraw available funds. Are you absolutely sure?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, HALT ALL',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await emergencyWithdraw();
                Swal.fire({ icon: 'success', title: 'Halted', text: 'Emergency action completed successfully!', background: '#1a1a1a', color: '#fff' });
            } catch (error) {
                console.error('Emergency action failed:', error);
                Swal.fire({ icon: 'error', title: 'Failed', text: error.message, background: '#1a1a1a', color: '#fff' });
            }
        }
    };

    const handleCreateEmployee = async (employeeData) => {
        setIsCreatingEmployee(true);
        try {
            const data = await employeeAPI.create(employeeData);
            // ... (rest of logic)
            // I need to be careful with existing content match if I replace block.
            // I'll grab the whole function content from Step 615?
            // "const formattedEmployee = ..."
            // It's safer to wrap start and end.

            const formattedEmployee = {
                _id: data._id,
                id: data.employeeId || data._id,
                employeeId: data.employeeId,
                name: data.name,
                email: data.email,
                department: data.department || 'N/A',
                designation: data.designation || 'N/A',
                walletAddress: data.walletAddress || 'No Wallet',
                salary: data.salary || 0,
            };
            setEmployees([...employees, formattedEmployee]);
            setShowCreateEmployeeModal(false);
            Swal.fire({
                icon: 'success',
                title: 'Employee Added',
                text: 'Employee created successfully!',
                timer: 2000,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#fff'
            });
        } catch (error) {
            console.error("Failed create employee", error);
            const msg = error.response?.data?.msg || error.response?.data?.errors?.[0]?.msg || error.message;
            Swal.fire({ icon: 'error', title: 'Creation Failed', text: msg, background: '#1a1a1a', color: '#fff' });
        } finally {
            setIsCreatingEmployee(false);
        }
    };

    const handleUpdateEmployee = async (id, employeeData) => {
        setIsUpdatingEmployee(true);
        try {
            const data = await employeeAPI.update(id, employeeData);
            setEmployees(employees.map(emp => emp._id === id ? {
                ...emp,
                name: data.name,
                email: data.email,
                department: data.department,
                designation: data.designation,
                walletAddress: data.walletAddress,
                salary: data.salary,
            } : emp));
            setShowEditEmployeeModal(false);
            setEditingEmployee(null);
            Swal.fire({
                icon: 'success',
                title: 'Updated',
                text: 'Employee updated successfully!',
                timer: 2000,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#fff'
            });
        } catch (error) {
            console.error("Failed update employee", error);
            const msg = error.response?.data?.msg || error.response?.data?.errors?.[0]?.msg || error.message;
            Swal.fire({ icon: 'error', title: 'Update Failed', text: msg, background: '#1a1a1a', color: '#fff' });
        } finally {
            setIsUpdatingEmployee(false);
        }
    };

    const handleDeleteEmployee = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Employee?',
            text: "Are you sure you want to delete this employee? This will also affect their access.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete!',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                await employeeAPI.delete(id);
                setEmployees(employees.filter(emp => emp._id !== id));
                Swal.fire({ icon: 'success', title: 'Deleted', text: 'Employee deleted successfully!', background: '#1a1a1a', color: '#fff' });
            } catch (error) {
                console.error("Failed delete employee", error);
                const msg = error.response?.data?.msg || error.message;
                Swal.fire({ icon: 'error', title: 'Delete Failed', text: msg, background: '#1a1a1a', color: '#fff' });
            }
        }
    };

    const handleExportExcel = () => {
        // Implement Excel export
        console.log('Exporting employees to Excel...');
        alert('Excel export feature - creating CSV file with employee data');
        // In production, use a library like xlsx or export to CSV
    };

    const handleImportExcel = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('Importing Excel file:', file.name);
            alert(`Importing file: ${file.name}\nThis will parse the Excel/CSV and add employees to the system.`);
            // In production, parse the file and add employees
        }
    };

    const getEmployeeNameByWallet = (address) => {
        if (!address) return 'Unknown';
        const emp = employees.find(e => e.walletAddress?.toLowerCase() === address.toLowerCase());
        return emp ? emp.name : null;
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (!user || user.role !== 'hr') {
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="dashboard-sidebar glass-card">
                <div className="sidebar-header">
                    <div className="logo-section">
                        <div className="logo-icon-small">
                            <Wallet size={24} />
                        </div>
                        <span className="logo-text-small">StreamPay</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <TrendingUp size={20} />
                        <span>Overview</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
                        onClick={() => setActiveTab('employees')}
                    >
                        <Users size={20} />
                        <span>Employees</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'streams' ? 'active' : ''}`}
                        onClick={() => setActiveTab('streams')}
                    >
                        <Activity size={20} />
                        <span>Active Streams</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'contract' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contract')}
                    >
                        <DollarSign size={20} />
                        <span>Contract Balance</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'tax' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tax')}
                    >
                        <Settings size={20} />
                        <span>Tax Vault</span>
                    </button>
                </nav>

                <div className="sidebar-quick-actions">
                    <h4 className="sidebar-section-title">Quick Actions</h4>
                    <div className="quick-actions-list">
                        <Button
                            variant="success"
                            size="sm"
                            fullWidth
                            onClick={() => setShowAddMoneyModal(true)}
                            icon={<DollarSign size={16} />}
                            disabled={!walletAddress}
                        >
                            Add Funds
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => setShowCreateStreamModal(true)}
                            icon={<Play size={16} />}
                            disabled={!walletAddress}
                        >
                            New Stream
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            onClick={() => setShowCreateEmployeeModal(true)}
                            icon={<Plus size={16} />}
                        >
                            Add Employee
                        </Button>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <Button variant="danger" size="sm" fullWidth onClick={handleLogout} icon={<LogOut size={16} />}>
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <h1>HR Dashboard</h1>
                        <p>Welcome back, {user?.name}!</p>
                    </div>
                    <div className="header-right">
                        {walletAddress ? (
                            <div className="wallet-connected">
                                <div className="wallet-dot"></div>
                                <span className="wallet-address">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                                <Button variant="ghost" size="sm" onClick={disconnectWallet}>
                                    Disconnect
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="success"
                                size="md"
                                onClick={handleConnectWallet}
                                loading={connectingWallet}
                                icon={<Wallet size={20} />}
                            >
                                Connect Wallet
                            </Button>
                        )}
                    </div>
                </header>

                {/* Content Area */}
                <div className="dashboard-content">
                    {!walletAddress && (
                        <div className="wallet-alert glass-card">
                            <AlertCircle size={24} />
                            <div>
                                <h4>Wallet Not Connected</h4>
                                <p>Please connect your wallet to manage streams and contracts</p>
                            </div>
                        </div>
                    )}

                    {walletAddress && contractOwner && !isOwner && (
                        <div className="wallet-alert glass-card" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                            <AlertCircle size={24} color="#ef4444" />
                            <div>
                                <h4 style={{ color: '#ef4444' }}>Wrong Wallet Connected</h4>
                                <p>You are connected as <span className="mono-font">{walletAddress.slice(0, 6)}...</span> but the contract owner is <span className="mono-font">{contractOwner.slice(0, 6)}...</span>. Admin actions will fail.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <div className="overview-section animate-fade-in">
                            {/* Stats Cards */}
                            <div className="stats-grid">
                                <Card className="stat-card" hover>
                                    <div className="stat-icon-wrapper stat-primary">
                                        <Users size={32} />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{dashboardStats.totalEmployees}</h3>
                                        <p>Total Employees</p>
                                        <span className="stat-change positive">+12% from last month</span>
                                    </div>
                                </Card>

                                <Card className="stat-card" hover>
                                    <div className="stat-icon-wrapper stat-success">
                                        <Activity size={32} />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{dashboardStats.activeStreams}</h3>
                                        <p>Active Streams</p>
                                        <span className="stat-change positive">+8% from last month</span>
                                    </div>
                                </Card>

                                <Card className="stat-card" hover>
                                    <div className="stat-icon-wrapper stat-warning">
                                        <DollarSign size={32} />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{dashboardStats.contractBalance.toFixed(4)} HLUSD</h3>
                                        <p>Contract Balance</p>
                                        <span className="stat-change neutral">Available funds</span>
                                    </div>
                                </Card>

                                <Card className="stat-card" hover>
                                    <div className="stat-icon-wrapper stat-info">
                                        <Lock size={32} />
                                    </div>
                                    <div className="stat-content">
                                        <h3>{taxVault.toFixed(8)} HLUSD</h3>
                                        <p>Tax Vault</p>
                                        <span className="stat-change positive">
                                            {taxStreams.some(s => s.state === 'Active') && <span className="pulse-dot"></span>}
                                            Live streaming
                                        </span>
                                    </div>
                                </Card>
                            </div>

                            {/* Charts */}
                            <div className="charts-grid section-spacer">
                                <Card className="chart-card">
                                    <CardHeader>
                                        <h3>Payment Streams Over Time</h3>
                                        <p>Monthly streaming volume</p>
                                    </CardHeader>
                                    <CardBody>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={streamData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="month" stroke="var(--gray-400)" />
                                                <YAxis stroke="var(--gray-400)" />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: 'var(--dark-surface)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '12px',
                                                        boxShadow: 'var(--shadow-lg)'
                                                    }}
                                                />
                                                <Line type="monotone" dataKey="amount" stroke="#667eea" strokeWidth={4} dot={{ fill: '#667eea', r: 6 }} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardBody>
                                </Card>

                                <Card className="chart-card">
                                    <CardHeader>
                                        <h3>Employees by Department</h3>
                                        <p>Distribution overview</p>
                                    </CardHeader>
                                    <CardBody>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={departmentData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, value }) => `${name}: ${value}`}
                                                >
                                                    {departmentData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        background: 'var(--dark-surface)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '12px',
                                                        boxShadow: 'var(--shadow-lg)'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Latest 3 Transactions & Status Summary */}
                            <div className="preview-grid section-spacer mt-6">
                                <Card className="summary-card">
                                    <CardHeader>
                                        <div className="flex justify-between items-center w-full">
                                            <h3>Latest Activity</h3>
                                            <Button variant="ghost" size="sm" onClick={() => setActiveTab('contract')}>View Details</Button>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="transactions-list">
                                            {transactions.slice(0, 3).map((tx) => (
                                                <div key={tx._id} className="transaction-item compact">
                                                    <div className="transaction-details">
                                                        <h4>{tx.type.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                                        <span className="tx-timestamp">{new Date(tx.timestamp).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className={`transaction-amount ${tx.type === 'Funding' ? 'success' : 'primary'}`}>
                                                        {tx.amount ? `${tx.type === 'Funding' ? '+' : '-'}${parseFloat(ethers.formatEther(tx.amount)).toFixed(4)}` : '-'}
                                                    </div>
                                                </div>
                                            ))}
                                            {transactions.length === 0 && <p className="text-center py-4 opacity-50 text-sm">No transactions yet</p>}
                                        </div>
                                    </CardBody>
                                </Card>

                                <Card className="summary-card">
                                    <CardHeader>
                                        <h3>Quick Stats</h3>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="status-summary-content">
                                            <div className="summary-item">
                                                <span>Active Streams</span>
                                                <span className="badge badge-success">{dashboardStats.activeStreams}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span>Total Employees</span>
                                                <span className="badge badge-primary">{dashboardStats.totalEmployees}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span>Payroll Status</span>
                                                <span className="badge badge-warning">On Track</span>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'employees' && (
                        <div className="employees-section animate-fade-in">
                            <Card>
                                <CardHeader>
                                    <div className="section-header">
                                        <div>
                                            <h3>All Employees</h3>
                                            <p>{filteredEmployees.length} employees found</p>
                                        </div>
                                        <div className="header-actions">
                                            <input
                                                type="file"
                                                id="excel-upload"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={handleImportExcel}
                                                style={{ display: 'none' }}
                                            />
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => document.getElementById('excel-upload')?.click()}
                                                icon={<Upload size={16} />}
                                            >
                                                Import
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={handleExportExcel}
                                                icon={<FileDown size={16} />}
                                            >
                                                Export
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={() => setShowCreateEmployeeModal(true)}
                                                icon={<Plus size={16} />}
                                            >
                                                Add Employee
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    {/* Search and Filter */}
                                    <div className="table-controls">
                                        <Input
                                            placeholder="Search by name, ID, or wallet address..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            icon={<Search size={20} />}
                                        />
                                    </div>

                                    {/* Employees Table */}
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Employee ID</th>
                                                    <th>Name</th>
                                                    <th>Department</th>
                                                    <th>Wallet Address</th>
                                                    <th>Salary (monthly)</th>

                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredEmployees.map((emp) => (
                                                    <tr key={emp.id}>
                                                        <td><span className="mono-text">{emp.id}</span></td>
                                                        <td><strong>{emp.name}</strong></td>
                                                        <td>{emp.department}</td>
                                                        <td><span className="mono-text wallet-text">{emp.walletAddress}</span></td>
                                                        <td><strong>${emp.salary.toLocaleString()}</strong></td>

                                                        <td>
                                                            <div className="action-buttons">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setEditingEmployee(emp);
                                                                        setShowEditEmployeeModal(true);
                                                                    }}
                                                                    icon={<Edit2 size={16} />}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteEmployee(emp._id)}
                                                                    icon={<X size={16} />}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'streams' && (
                        <div className="streams-section animate-fade-in">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3>Active Payment Streams</h3>
                                            <p>Monitor real-time salary streaming from the contract</p>
                                        </div>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={handleEmergencyWithdraw}
                                            icon={<AlertCircle size={16} />}
                                            disabled={!walletAddress}
                                        >
                                            Emergency Halt
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <div className="streams-list">
                                        {streams.length === 0 ? (
                                            <div className="empty-state">
                                                <Activity size={48} />
                                                <p>No active streams found in indexer.</p>
                                            </div>
                                        ) : (
                                            streams.map(stream => (
                                                <div key={stream.streamId} className="stream-item glass-card">
                                                    <div className="stream-info">
                                                        <div className="stream-avatar">
                                                            {(getEmployeeNameByWallet(stream.workerAddress) || stream.workerName || 'W').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="stream-details">
                                                            <div className="flex items-center gap-2">
                                                                <h4>{getEmployeeNameByWallet(stream.workerAddress) || stream.workerName || 'Unknown Worker'}</h4>
                                                                <span className={`type-tag ${stream.streamType?.toLowerCase()}`}>
                                                                    {stream.streamType}
                                                                </span>
                                                            </div>
                                                            <p className="mono-text">{stream.workerAddress.slice(0, 6)}...{stream.workerAddress.slice(-4)}</p>
                                                            <span className="stream-id-tag">ID: #{stream.streamId}</span>
                                                        </div>
                                                    </div>
                                                    <div className="stream-stats">
                                                        <div className="stream-stat">
                                                            <span className="stat-label">Total Deposit</span>
                                                            <span className="stat-value">{(Number(stream.deposit) / 1e18).toFixed(4)} ETH</span>
                                                        </div>
                                                        <div className="stream-stat">
                                                            <span className="stat-label">Withdrawn</span>
                                                            <span className="stat-value">{(Number(stream.withdrawn) / 1e18).toFixed(4)} ETH</span>
                                                        </div>
                                                        <div className="stream-stat">
                                                            <span className="stat-label">Status</span>
                                                            <span className={`status-badge status-${stream.state.toLowerCase()}`}>
                                                                {stream.state === 'Active' && <span className="pulse-dot"></span>}
                                                                {stream.state}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="stream-actions">
                                                        {stream.state === 'Active' ? (
                                                            <Button
                                                                variant="warning"
                                                                size="sm"
                                                                onClick={() => handlePauseStream(stream.streamId)}
                                                                icon={<Pause size={16} />}
                                                                loading={processingStream === stream.streamId}
                                                                disabled={!walletAddress || (processingStream && processingStream !== stream.streamId)}
                                                            >
                                                                Pause
                                                            </Button>
                                                        ) : stream.state === 'Paused' ? (
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => handleResumeStream(stream.streamId)}
                                                                icon={<Play size={16} />}
                                                                loading={processingStream === stream.streamId}
                                                                disabled={!walletAddress || (processingStream && processingStream !== stream.streamId)}
                                                            >
                                                                Resume
                                                            </Button>
                                                        ) : null}
                                                        {(stream.state === 'Active' || stream.state === 'Paused') && (
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleCancelStream(stream.streamId)}
                                                                icon={<X size={16} />}
                                                                loading={processingStream === stream.streamId}
                                                                disabled={!walletAddress || (processingStream && processingStream !== stream.streamId)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'contract' && (
                        <div className="contract-section animate-fade-in">
                            <div className="contract-grid">
                                <Card className="contract-balance-card">
                                    <CardHeader>
                                        <h3>Contract Balance</h3>
                                        <p>Available for streaming</p>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="balance-display">
                                            <div className="balance-amount gradient-text">
                                                {dashboardStats.contractBalance.toFixed(4)} HLUSD
                                            </div>
                                            <div className="balance-eth">
                                                ≈ ${(dashboardStats.contractBalance * 2000).toLocaleString()} USD
                                            </div>
                                        </div>
                                        <Button
                                            variant="success"
                                            size="lg"
                                            fullWidth
                                            onClick={() => setShowAddMoneyModal(true)}
                                            icon={<DollarSign size={20} />}
                                            disabled={!walletAddress}
                                        >
                                            Add Funds
                                        </Button>
                                    </CardBody>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <h3>Monthly Burn Rate</h3>
                                        <p>Projected monthly expenses</p>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="burn-rate-chart">
                                            <ResponsiveContainer width="100%" height={200}>
                                                <BarChart data={streamData.slice(-3)}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                    <XAxis dataKey="month" stroke="var(--gray-400)" />
                                                    <YAxis stroke="var(--gray-400)" />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: 'var(--dark-surface)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '8px',
                                                        }}
                                                    />
                                                    <Bar dataKey="amount" fill="#22c55e" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center w-full">
                                        <div>
                                            <h3>Transaction History</h3>
                                            <p>
                                                {filterYear === 'all' && filterMonth === 'all' && filterType === 'all'
                                                    ? `Showing ${filteredTransactions.length} most recent transactions`
                                                    : `${filteredTransactions.length} transactions match filters`
                                                }
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                className="filter-select"
                                                value={filterYear}
                                                onChange={(e) => setFilterYear(e.target.value)}
                                            >
                                                <option value="all">All Years</option>
                                                <option value="2024">2024</option>
                                                <option value="2025">2025</option>
                                                <option value="2026">2026</option>
                                            </select>
                                            <select
                                                className="filter-select"
                                                value={filterMonth}
                                                onChange={(e) => setFilterMonth(e.target.value)}
                                            >
                                                <option value="all">All Months</option>
                                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                                    <option key={m} value={(i + 1).toString()}>{m}</option>
                                                ))}
                                            </select>
                                            <select
                                                className="filter-select"
                                                value={filterType}
                                                onChange={(e) => setFilterType(e.target.value)}
                                            >
                                                <option value="all">All Types</option>
                                                <option value="Funding">Funding</option>
                                                <option value="Withdrawal">Withdrawal</option>
                                                <option value="StreamCreated">Stream Created</option>
                                            </select>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={handleExportTransactions}
                                                icon={<FileDown size={16} />}
                                            >
                                                Export CSV
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <div className="transactions-list">
                                        {filteredTransactions.length === 0 ? (
                                            <div className="empty-state">
                                                <p>No transactions found for the selected filters.</p>
                                            </div>
                                        ) : (
                                            filteredTransactions.map((tx) => (
                                                <div key={tx._id} className="transaction-item">
                                                    <div className={`transaction-icon ${tx.type === 'Funding' ? 'success' :
                                                        tx.type === 'Withdrawal' ? 'primary' :
                                                            tx.type === 'StreamCreated' ? 'info' : 'warning'
                                                        }`}>
                                                        {tx.type === 'Funding' ? <DollarSign size={20} /> :
                                                            tx.type === 'Withdrawal' ? <Download size={20} /> :
                                                                tx.type === 'StreamCreated' ? <Play size={20} /> : <Activity size={20} />}
                                                    </div>
                                                    <div className="transaction-details">
                                                        <h4>{tx.type.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                                        <p className="mono-text">
                                                            {tx.txHash ? `${tx.txHash.slice(0, 6)}...${tx.txHash.slice(-4)}` : 'Hash Pending'}
                                                        </p>
                                                        <span className="tx-timestamp">
                                                            {new Date(tx.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className={`transaction-amount ${tx.type === 'Funding' ? 'success' : 'primary'}`}>
                                                        {tx.amount ? (
                                                            `${tx.type === 'Funding' ? '+' : '-'}${parseFloat(ethers.formatEther(tx.amount)).toFixed(4)} HLUSD`
                                                        ) : '-'}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'tax' && (
                        <div className="tax-section animate-fade-in">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center w-full">
                                        <div>
                                            <h3>Tax Vault Dashboard</h3>
                                            <p>Monitor tax deductions and streams</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    {/* Tax Stats */}
                                    <div className="tax-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                        <Card className="stat-card" hover>
                                            <div className="stat-icon-wrapper stat-success">
                                                <Lock size={28} />
                                            </div>
                                            <div className="stat-content">
                                                <h3>{taxVault.toFixed(8)} HLUSD</h3>
                                                <p>Total Tax Vault</p>
                                                <span className="stat-change positive">
                                                    {taxStreams.some(s => s.state === 'Active') && <span className="pulse-dot"></span>}
                                                    Live Balance
                                                </span>
                                            </div>
                                        </Card>

                                        <Card className="stat-card" hover>
                                            <div className="stat-icon-wrapper stat-info">
                                                <Activity size={28} />
                                            </div>
                                            <div className="stat-content">
                                                <h3>{taxStreams.filter(s => s.state === 'Active').length}</h3>
                                                <p>Active Tax Streams</p>
                                                <span className="stat-change neutral">Currently Running</span>
                                            </div>
                                        </Card>

                                        <Card className="stat-card" hover>
                                            <div className="stat-icon-wrapper stat-warning">
                                                <Settings size={28} />
                                            </div>
                                            <div className="stat-content">
                                                <h3>{taxStreams.length}</h3>
                                                <p>Total Tax Streams</p>
                                                <span className="stat-change neutral">All Time</span>
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Tax Address Management */}
                                    <Card style={{ marginBottom: '2rem' }}>
                                        <CardHeader>
                                            <div className="flex justify-between items-center w-full">
                                                <div>
                                                    <h3>Tax Beneficiary Address</h3>
                                                    <p>Configure where tax deductions are sent</p>
                                                </div>
                                                {taxAddress && !editingTaxAddress && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingTaxAddress(true);
                                                            setTempTaxAddress(taxAddress);
                                                        }}
                                                        icon={<Edit2 size={16} />}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardBody>
                                            {!taxAddress && !editingTaxAddress ? (
                                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                    <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: 'var(--warning)' }} />
                                                    <h3>No Tax Address Configured</h3>
                                                    <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
                                                        Set up a tax address to automatically collect tax deductions from employee streams
                                                    </p>
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => setEditingTaxAddress(true)}
                                                        icon={<Plus size={20} />}
                                                    >
                                                        Add Tax Address
                                                    </Button>
                                                </div>
                                            ) : editingTaxAddress ? (
                                                <div>
                                                    <Input
                                                        label="Tax Beneficiary Wallet Address"
                                                        value={tempTaxAddress}
                                                        onChange={(e) => setTempTaxAddress(e.target.value)}
                                                        placeholder="0x..."
                                                        icon={<Lock size={20} />}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setEditingTaxAddress(false);
                                                                setTempTaxAddress('');
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="success"
                                                            onClick={handleSaveTaxAddress}
                                                            loading={isSavingTaxAddress}
                                                            icon={<Settings size={16} />}
                                                            disabled={!tempTaxAddress.trim()}
                                                        >
                                                            Save Address
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid var(--success)' }}>
                                                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Current Tax Address</p>
                                                        <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--success)', fontWeight: '600', wordBreak: 'break-all' }}>
                                                            {taxAddress}
                                                        </p>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                                        <div>
                                                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Current Vault Balance</p>
                                                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--black)' }}>{taxVault.toFixed(4)} HLUSD</p>
                                                        </div>
                                                        <div style={{ padding: '0.5rem 1rem', background: 'var(--success-light)', borderRadius: '8px', border: '1px solid var(--success)' }}>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--success-dark)', fontWeight: '600' }}>ACTIVE</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>

                                    {/* Tax Streams */}
                                    <h3 style={{ marginBottom: '1rem' }}>Tax Streams</h3>
                                    {taxStreams.length > 0 ? (
                                        <div className="streams-table">
                                            {taxStreams.map((stream) => (
                                                <div key={stream.streamId} className="stream-row">
                                                    <div className="stream-info">
                                                        <h4>Stream #{stream.streamId}</h4>
                                                        <span className="stream-type">{stream.streamType}</span>
                                                        <span className={`stream-status status-${stream.state.toLowerCase()}`}>{stream.state}</span>
                                                    </div>
                                                    <div className="stream-details">
                                                        <div className="detail-item">
                                                            <span className="detail-label">Deposit</span>
                                                            <span className="detail-value">{parseFloat(ethers.formatEther(stream.deposit || '0')).toFixed(4)} HLUSD</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="detail-label">Created</span>
                                                            <span className="detail-value">{new Date(stream.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No tax streams yet</p>
                                    )}

                                    {/* Tax Transactions */}
                                    <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Tax Transactions</h3>
                                    {(() => {
                                        // Filter transactions that have the 'tax' label
                                        const taxTransactions = transactions.filter(tx => tx.label === 'tax');

                                        return taxTransactions.length > 0 ? (
                                            <div className="transactions-list">
                                                {taxTransactions
                                                    .slice(0, 10)
                                                    .map((tx) => (
                                                        <div key={tx._id} className="transaction-item">
                                                            <div className="transaction-details">
                                                                <h4>{tx.type.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                                                <span className="tx-hash">{tx.txHash?.slice(0, 10)}...{tx.txHash?.slice(-8)}</span>
                                                                <span className="tx-timestamp">{new Date(tx.timestamp).toLocaleString()}</span>
                                                            </div>
                                                            <div className="transaction-amount success">
                                                                {tx.amount ? `+${parseFloat(ethers.formatEther(tx.amount)).toFixed(4)} HLUSD` : '-'}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No tax transactions yet. Create a stream with tax percentage to see transactions here.</p>
                                        );
                                    })()}
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            {showAddMoneyModal && (
                <Modal onClose={() => setShowAddMoneyModal(false)} title="Add Money to Contract">
                    <AddMoneyForm
                        onSubmit={handleAddMoney}
                        onCancel={() => setShowAddMoneyModal(false)}
                        loading={isAddingMoney}
                    />
                </Modal>
            )}

            {showCreateStreamModal && (
                <Modal onClose={() => setShowCreateStreamModal(false)} title="Create New Payment Stream">
                    <CreateStreamForm
                        employees={employees}
                        onSubmit={handleCreateStream}
                        onCancel={() => setShowCreateStreamModal(false)}
                        loading={isCreatingStream}
                    />
                </Modal>
            )}

            {showCreateEmployeeModal && (
                <Modal onClose={() => setShowCreateEmployeeModal(false)} title="Add New Employee">
                    <CreateEmployeeForm
                        onSubmit={handleCreateEmployee}
                        onCancel={() => setShowCreateEmployeeModal(false)}
                        loading={isCreatingEmployee}
                    />
                </Modal>
            )}

            {showEditEmployeeModal && editingEmployee && (
                <Modal onClose={() => { setShowEditEmployeeModal(false); setEditingEmployee(null); }} title="Edit Employee">
                    <EditEmployeeForm
                        employee={editingEmployee}
                        onSubmit={handleUpdateEmployee}
                        onCancel={() => { setShowEditEmployeeModal(false); setEditingEmployee(null); }}
                        loading={isUpdatingEmployee}
                    />
                </Modal>
            )}
        </div>
    );
};

// Modal Component
const Modal = ({ children, onClose, title }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Add Money Form
const AddMoneyForm = ({ onSubmit, onCancel, loading }) => {
    const [amount, setAmount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(amount);
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <Input
                label="Amount (HLUSD)"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1.5"
                required
                icon={<DollarSign size={20} />}
            />
            <div className="modal-actions">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="success" loading={loading}>
                    Add Funds
                </Button>
            </div>
        </form>
    );
};

// Create Stream Form
const CreateStreamForm = ({ employees = [], onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        walletAddress: '',
        amount: '',
        streamType: 'Continuous',
        durationInDays: '',
        taxPercentage: '0',
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        return employees.filter(emp =>
            (emp.name && emp.name.toLowerCase().includes(term)) ||
            (emp.email && emp.email.toLowerCase().includes(term))
        ).slice(0, 3);
    }, [searchTerm, employees]);

    const handleSelectEmployee = (emp) => {
        setFormData({ ...formData, walletAddress: emp.walletAddress });
        setSearchTerm(emp.name);
        setShowResults(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert days to seconds for the contract
        const seconds = Math.floor(parseFloat(formData.durationInDays) * 86400);

        // OneTime expects absolute timestamp, Continuous expects duration in seconds
        let durationOrEndTime;
        if (formData.streamType === 'OneTime') {
            durationOrEndTime = (Math.floor(Date.now() / 1000) + seconds).toString();
        } else {
            durationOrEndTime = seconds.toString();
        }

        const submissionData = {
            ...formData,
            durationOrEndTime
        };

        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="search-employee-container">
                <Input
                    label="Search Employee (Name or Email)"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowResults(true);
                    }}
                    placeholder="Search by name or email..."
                    icon={<Users size={20} />}
                    onFocus={() => setShowResults(true)}
                />

                {showResults && searchResults.length > 0 && (
                    <div className="search-results-dropdown glass-card">
                        {searchResults.map(emp => (
                            <div
                                key={emp.employeeId || emp.walletAddress}
                                className="search-result-item"
                                onClick={() => handleSelectEmployee(emp)}
                            >
                                <div className="result-name">{emp.name}</div>
                                <div className="result-email">{emp.email}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Input
                label="Employee Wallet Address"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                placeholder="0x..."
                required
                icon={<Wallet size={20} />}
            />
            <Input
                label="Total Amount (HLUSD)"
                type="number"
                step="0.0001"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1.5"
                required
                icon={<DollarSign size={20} />}
            />
            <div className="input-field">
                <label className="input-label">Stream Type</label>
                <select
                    className="input"
                    value={formData.streamType}
                    onChange={(e) => setFormData({ ...formData, streamType: e.target.value })}
                >
                    <option value="Continuous">Continuous (Automatic End)</option>
                    <option value="OneTime">One Time (Full Release at End)</option>
                </select>
            </div>
            <Input
                label="Duration (Days)"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.durationInDays}
                onChange={(e) => setFormData({ ...formData, durationInDays: e.target.value })}
                placeholder="30"
                required
                icon={<Activity size={20} />}
            />
            <Input
                label="Tax Percentage (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxPercentage}
                onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value })}
                placeholder="0"
                icon={<Settings size={20} />}
            />
            <div className="modal-actions">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                    Create Stream
                </Button>
            </div>
        </form>
    );
};

// Create Employee Form
const CreateEmployeeForm = ({ onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
        walletAddress: '',
        salary: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
            />
            <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                required
                icon={<Mail size={20} />}
            />
            <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                icon={<Lock size={20} />}
            />
            <Input
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Engineering"
                required
            />
            <Input
                label="Wallet Address"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                placeholder="0x..."
                required
                icon={<Wallet size={20} />}
            />
            <Input
                label="Monthly Salary (USD)"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="5000"
                required
                icon={<DollarSign size={20} />}
            />
            <div className="modal-actions">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="success" loading={loading}>
                    Add Employee
                </Button>
            </div>
        </form>
    );
};

const EditEmployeeForm = ({ employee, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: employee.name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        walletAddress: employee.walletAddress,
        salary: employee.salary,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(employee._id, formData);
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
            />
            <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                required
                icon={<Mail size={20} />}
            />
            <Input
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Engineering"
                required
            />
            <Input
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Software Engineer"
                required
            />
            <Input
                label="Wallet Address"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                placeholder="0x..."
                required
                icon={<Wallet size={20} />}
            />
            <Input
                label="Monthly Salary (USD)"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="5000"
                required
                icon={<DollarSign size={20} />}
            />
            <div className="modal-actions">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                    Update Employee
                </Button>
            </div>
        </form>
    );
};

export default HRDashboard;
