import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import HomeFeed from '../components/feed/HomeFeed';
import JobsTab from '../components/jobs/JobsTab';
import EventsTab from '../components/events/EventsTab';
import AirdropsTab from '../components/airdrops/AirdropsTab';

type Tab = 'feed' | 'jobs' | 'events' | 'airdrops';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'feed', label: 'Home Feed', icon: '🏠' },
  { id: 'jobs', label: 'Jobs', icon: '💼' },
  { id: 'events', label: 'Events', icon: '🎪' },
  { id: 'airdrops', label: 'Airdrops', icon: '🎁' },
];

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Derived directly from URL — no stale state
  const activeTab: Tab =
    location.pathname === '/jobs' ? 'jobs' :
    location.pathname === '/events' ? 'events' :
    location.pathname === '/airdrops' ? 'airdrops' :
    'feed';

  const handleTabChange = (tab: Tab) => {
    const paths: Record<Tab, string> = { feed: '/home', jobs: '/jobs', events: '/events', airdrops: '/airdrops' };
    navigate(paths[tab]);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Tab switcher — visible on mobile too */}
        <div className="flex items-center gap-1 mb-8 p-1 rounded-2xl md:hidden overflow-x-auto"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-mint-400 bg-mint-500/15'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Page header */}
        <div className="mb-6">
          {activeTab === 'feed' && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white">
                Welcome back <span className="mint-gradient-text">🐒</span>
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Your personalized Web3 professional feed
              </p>
            </div>
          )}
          {activeTab === 'jobs' && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white">
                Job <span className="mint-gradient-text">Opportunities</span>
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Hand-picked roles from top Web3 portals
              </p>
            </div>
          )}
          {activeTab === 'events' && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white">
                Events &amp; <span className="mint-gradient-text">Workshops</span>
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Nearby hackathons, meetups, and learning events
              </p>
            </div>
          )}
          {activeTab === 'airdrops' && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white">
                Active <span className="mint-gradient-text">Airdrops</span>
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Exclusive drops for helaconntect users
              </p>
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'feed' && <HomeFeed />}
          {activeTab === 'jobs' && <JobsTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'airdrops' && <AirdropsTab />}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
