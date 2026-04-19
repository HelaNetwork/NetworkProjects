'use client';

import { useState } from 'react';
import { formatEther, parseEther } from 'viem';

interface RampServiceProps {
    hlusdAmount: string;
    onClose: () => void;
    onSuccess: (txId: string) => void;
}

// Mock exchange rates
const MOCK_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.12,
    JPY: 149.50,
};

type Currency = keyof typeof MOCK_RATES;

export function MockRampService({ hlusdAmount, onClose, onSuccess }: RampServiceProps) {
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
    const [bankAccount, setBankAccount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const hlusdValue = parseFloat(hlusdAmount) || 0;
    const fiatAmount = (hlusdValue * MOCK_RATES[selectedCurrency]).toFixed(2);

    const handleConvert = async () => {
        if (!bankAccount) {
            alert('Please enter your bank account details');
            return;
        }

        setIsProcessing(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockTxId = `RAMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        setIsProcessing(false);
        onSuccess(mockTxId);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Convert to Fiat</h2>
                        <p className="text-sm text-gray-500 mt-1">Cash out your HLUSD</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Amount Display */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">You're converting</p>
                            <p className="text-3xl font-bold text-gray-900">{hlusdAmount.slice(0,10)} HLUSD</p>
                        </div>
                        {/* <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">HL</span>
                        </div> */}
                    </div>
                    
                    <div className="flex items-center justify-center my-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">You'll receive</p>
                            <p className="text-3xl font-bold text-green-600">{fiatAmount} {selectedCurrency}</p>
                        </div>
                    </div>
                </div>

                {/* Currency Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Currency</label>
                    <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none text-gray-900"
                    >
                        <option value="USD">🇺🇸 USD - US Dollar</option>
                        <option value="EUR">🇪🇺 EUR - Euro</option>
                        <option value="GBP">🇬🇧 GBP - British Pound</option>
                        <option value="INR">🇮🇳 INR - Indian Rupee</option>
                        <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                    </select>
                </div>

                {/* Bank Account */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account / UPI ID</label>
                    <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Enter your bank account or UPI ID"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none text-gray-900"
                    />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Mock Service</p>
                            <p className="text-blue-700">This is a demonstration of on-ramp/off-ramp functionality. In production, this would integrate with services like Transak, MoonPay, or Wyre.</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConvert}
                        disabled={isProcessing}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg font-semibold hover:from-gray-800 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            'Convert Now'
                        )}
                    </button>
                </div>

                {/* Exchange Rate Info */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    Exchange rate: 1 HLUSD = {MOCK_RATES[selectedCurrency]} {selectedCurrency}
                </p>
            </div>
        </div>
    );
}
