import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import BrowserView from '../components/BrowserView';
import WalletConnect from '../components/WalletConnect';
import DappStore from '../components/DappStore';
import TransactionPanel from '../components/TransactionPanel';
import { useWallet } from '../hooks/useWallet';
import { useTabs } from '../hooks/useTabs';
import { Wallet, Store, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const SIDEBAR_TABS = [
  { id: 'wallet', icon: Wallet, label: 'Wallet' },
  { id: 'dapps', icon: Store, label: 'dApps' },
  { id: 'tx', icon: Activity, label: 'Activity' },
];

const Home = () => {
  const wallet = useWallet();
  const tabState = useTabs();
  const [sidebarTab, setSidebarTab] = useState('wallet');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNavigate = (url, title) => {
    tabState.navigateTab(tabState.activeTabId, url, title || url);
  };

  return (
    <div
      className="flex flex-col h-full grid-bg scanlines"
      style={{ background: 'var(--bg-primary)', overflow: 'hidden' }}
    >
      {/* Top Navbar */}
      <Navbar wallet={wallet} />

      {/* Main Layout */}
      <div className="flex flex-1" style={{ overflow: 'hidden', minHeight: 0 }}>

        {/* Sidebar */}
        <div
          style={{
            width: sidebarOpen ? '260px' : '0',
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.25s ease',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Sidebar Tab Switcher */}
          <div className="flex" style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {SIDEBAR_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1 py-2.5"
                style={{
                  background: sidebarTab === tab.id ? 'var(--bg-card)' : 'transparent',
                  borderBottom: sidebarTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                  color: sidebarTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '0.65rem',
                  fontFamily: 'Space Mono, monospace',
                  cursor: 'pointer',
                  border: 'none',
                  borderBottom: `2px solid ${sidebarTab === tab.id ? 'var(--accent)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <tab.icon size={12} />
                <span style={{ display: sidebarOpen ? 'inline' : 'none' }}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {sidebarTab === 'wallet' && <WalletConnect wallet={wallet} />}
            {sidebarTab === 'dapps' && <DappStore onNavigate={handleNavigate} />}
            {sidebarTab === 'tx' && <TransactionPanel wallet={wallet} />}
          </div>
        </div>

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          style={{
            width: '16px',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {sidebarOpen ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
        </button>

        {/* Browser Panel */}
        <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <BrowserView
            tabs={tabState.tabs}
            activeTab={tabState.activeTab}
            activeTabId={tabState.activeTabId}
            onSelectTab={tabState.setActiveTabId}
            onCloseTab={tabState.closeTab}
            onNewTab={() => tabState.addTab()}
            navigateTab={tabState.navigateTab}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
