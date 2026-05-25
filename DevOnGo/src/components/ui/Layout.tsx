import { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/src/components/ui/Navbar';
import { Sidebar } from '@/src/components/ui/Sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from '@/src/utils/utils';

const LayoutContext = createContext({ hideSidebar: false, setHideSidebar: (h: boolean) => {} });
export const useLayout = () => useContext(LayoutContext);

export const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hideSidebar, setHideSidebar] = useState(false);

  return (
    <LayoutContext.Provider value={{ hideSidebar, setHideSidebar }}>
      <div className="flex h-screen bg-brand-bg relative overflow-hidden">
        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn("lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all", hideSidebar && "hidden")}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar - Desktop & Mobile */}
        {!hideSidebar && (
          <div className={cn(
            "fixed inset-y-0 left-0 z-40 lg:relative transition-transform duration-300 ease-in-out lg:translate-x-0",
            isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          )}>
            <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto w-full">
            <Outlet />
          </main>
        </div>

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </div>
    </LayoutContext.Provider>
  );
};
