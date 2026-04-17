import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import { Web3Provider } from './providers/Web3Provider';
import { useProgress } from './hooks/useProgress';

// A wrapper to handle persistent layouts
const Layout = ({ children }) => {
  const location = useLocation();
  const { xp, streak, level } = useProgress();
  const isLessonPage = location.pathname.startsWith('/lesson/');

  return (
    <div className="font-nunito">
      {!isLessonPage && <Navbar xp={xp} streak={streak} level={level} />}
      <main>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Web3Provider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lesson/:id" element={<Lesson />} />
          </Routes>
        </Layout>
      </Router>
    </Web3Provider>
  );
}

export default App;
