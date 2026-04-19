import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
    wagmiConfig,
    chains,
    RainbowKitProvider,
    WagmiConfig,
    darkTheme,
} from './wagmi';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import HRDashboard from './pages/HRDashboard';
import Employee from './pages/Employee';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains} theme={darkTheme()} coolMode>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Landing />} />
                            <Route path="/hr" element={<HRDashboard />} />
                            <Route path="/employee" element={<Employee />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </RainbowKitProvider>
        </WagmiConfig>
    </React.StrictMode>,
);
