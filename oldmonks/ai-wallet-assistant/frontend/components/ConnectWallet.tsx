'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reown?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appKit?: any;
  }
}

/**
 * ConnectWallet Component
 * Uses Reown AppKit to manage wallet connections
 */
export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [appKitReady, setAppKitReady] = useState(false);

  // Initialize Reown AppKit
  useEffect(() => {
    setMounted(true);

    const initAppKit = async () => {
      try {
        // Dynamically load and initialize AppKit
        const { createAppKit } = await import('@reown/appkit');
        const { mainnet } = await import('@reown/appkit/networks');

        const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

        if (!projectId || projectId === 'YOUR_PROJECT_ID') {
          console.warn('⚠️ Project ID not configured');
          return;
        }

        // Create and store AppKit instance
        const appKit = createAppKit({
          networks: [mainnet],
          projectId,
          features: {
            analytics: true,
          },
        });

        // Store in window for access in click handler
        window.appKit = appKit;

        // Give it a moment to initialize
        setTimeout(() => {
          setAppKitReady(true);
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize AppKit:', error);
      }
    };

    initAppKit();
  }, []);

  const handleConnectWallet = async () => {
    try {
      // Use AppKit's open method to show the modal
      if (window.appKit && window.appKit.open) {
        window.appKit.open();
      } else {
        console.warn('AppKit not initialized or open method not available');
        // Fallback: try to click the web component
        const appKitElement = document.querySelector('appkit-button') as HTMLElement;
        if (appKitElement) {
          appKitElement.click();
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  if (!mounted) {
    return (
      <div className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">
        Loading...
      </div>
    );
  }

  if (isConnected && address) {
    const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-900">{displayAddress}</span>
        </div>
        <button
          onClick={handleConnectWallet}
          className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          Manage
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnectWallet}
      disabled={!appKitReady}
      className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
        appKitReady
          ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          : 'bg-gray-400 cursor-not-allowed'
      }`}
    >
      {appKitReady ? 'Connect Wallet' : 'Initializing...'}
    </button>
  );
}
