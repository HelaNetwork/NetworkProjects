import { useState, useCallback } from 'react';

let tabCounter = 1;

const createTab = (url = '', title = 'New Tab') => ({
  id: `tab-${tabCounter++}`,
  url,
  title,
  favicon: null,
  loading: false,
});

export const useTabs = () => {
  const [tabs, setTabs] = useState([createTab('', 'New Tab')]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const addTab = useCallback((url = '', title = 'New Tab') => {
    const newTab = createTab(url, title);
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    return newTab.id;
  }, []);

  const closeTab = useCallback((tabId) => {
    setTabs(prev => {
      if (prev.length === 1) return [createTab('', 'New Tab')];
      const next = prev.filter(t => t.id !== tabId);
      if (tabId === activeTabId) {
        const closedIndex = prev.findIndex(t => t.id === tabId);
        const newActiveIndex = Math.min(closedIndex, next.length - 1);
        setActiveTabId(next[newActiveIndex].id);
      }
      return next;
    });
  }, [activeTabId]);

  const navigateTab = useCallback((tabId, url, title) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, url, title: title || url, loading: true } : t
    ));
    // Simulate load complete
    setTimeout(() => {
      setTabs(prev => prev.map(t =>
        t.id === tabId ? { ...t, loading: false } : t
      ));
    }, 1500);
  }, []);

  const updateTabTitle = useCallback((tabId, title, favicon) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, title, favicon } : t
    ));
  }, []);

  return {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    addTab,
    closeTab,
    navigateTab,
    updateTabTitle,
  };
};
