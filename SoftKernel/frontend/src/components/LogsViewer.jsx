import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import logsApi from '../services/logsApi';
import './LogsViewer.css';

export default function LogsViewer() {
  const { account } = useWallet();
  
  // State
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    level: [],
    category: [],
    startDate: '',
    endDate: '',
    userAddress: '',
    endpoint: '',
    search: '',
    tags: '',
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });
  
  // Available options
  const [levels, setLevels] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Selected log for detail view
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds

  // Load available levels and categories
  useEffect(() => {
    const loadOptions = async () => {
      if (!account) return;
      
      try {
        const [levelsData, categoriesData] = await Promise.all([
          logsApi.getLevels(account),
          logsApi.getCategories(account),
        ]);
        setLevels(levelsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load options:', err);
      }
    };
    
    loadOptions();
  }, [account]);

  // Load logs
  const loadLogs = async (page = pagination.page) => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading logs with account:', account);
      console.log('Filters:', filters);
      
      const data = await logsApi.getLogs({
        ...filters,
        level: filters.level.length > 0 ? filters.level : undefined,
        category: filters.category.length > 0 ? filters.category : undefined,
        page,
        limit: pagination.limit,
        walletAddress: account,
      });
      
      console.log('Logs loaded:', data);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error loading logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    if (!account) return;
    
    try {
      console.log('Loading stats with account:', account);
      const statsData = await logsApi.getStats({
        startDate: filters.startDate,
        endDate: filters.endDate,
        walletAddress: account,
      });
      console.log('Stats loaded:', statsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
      // Don't set error for stats, just log it
    }
  };

  // Initial load
  useEffect(() => {
    if (account) {
      loadLogs(1);
      loadStats();
    }
  }, [account]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !account) return;
    
    const interval = setInterval(() => {
      loadLogs();
      loadStats();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, account]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle checkbox filters
  const handleCheckboxFilter = (key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return {
        ...prev,
        [key]: updated,
      };
    });
  };

  // Apply filters
  const applyFilters = () => {
    loadLogs(1);
    loadStats();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      level: [],
      category: [],
      startDate: '',
      endDate: '',
      userAddress: '',
      endpoint: '',
      search: '',
      tags: '',
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
    setTimeout(() => {
      loadLogs(1);
      loadStats();
    }, 100);
  };

  // Export logs
  const handleExport = async () => {
    try {
      await logsApi.exportLogs({
        ...filters,
        walletAddress: account,
      });
    } catch (err) {
      setError('Failed to export logs: ' + err.message);
    }
  };

  // Cleanup logs
  const handleCleanup = async () => {
    if (!confirm('Delete logs older than 90 days?')) return;
    
    try {
      const result = await logsApi.cleanupLogs({
        daysToKeep: 90,
        walletAddress: account,
      });
      alert(result.message);
      loadLogs(1);
      loadStats();
    } catch (err) {
      setError('Failed to cleanup logs: ' + err.message);
    }
  };

  // Get level badge class
  const getLevelClass = (level) => {
    const classes = {
      info: 'log-level-info',
      success: 'log-level-success',
      warn: 'log-level-warn',
      error: 'log-level-error',
      debug: 'log-level-debug',
      security: 'log-level-security',
    };
    return classes[level] || 'log-level-default';
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format JSON
  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  if (!account) {
    return (
      <div className="logs-viewer">
        <div className="logs-error">
          Please connect your wallet to access logs
        </div>
        <div className="debug-info">
          <p>Debug Info:</p>
          <ul>
            <li>Account: {account || 'Not connected'}</li>
            <li>Admin Address: {import.meta.env.VITE_ADMIN_ADDRESS || 'Not configured'}</li>
            <li>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="logs-viewer">
      <div className="logs-header">
        <h1>System Logs</h1>
        <div className="logs-header-actions">
          <label className="auto-refresh-label">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh ({refreshInterval / 1000}s)
          </label>
          <button onClick={handleExport} className="btn-export">
            Export
          </button>
          <button onClick={handleCleanup} className="btn-cleanup">
            Cleanup Old Logs
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="logs-stats">
          <div className="stat-card">
            <div className="stat-label">Total Logs</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Errors</div>
            <div className="stat-value error">{stats.errors}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Duration</div>
            <div className="stat-value">{Math.round(stats.avgDuration)}ms</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">By Level</div>
            <div className="stat-breakdown">
              {Object.entries(stats.byLevel || {}).map(([level, count]) => (
                <div key={level} className="stat-item">
                  <span className={`stat-badge ${getLevelClass(level)}`}>{level}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="logs-filters">
        <h3>Filters</h3>
        
        <div className="filter-row">
          <div className="filter-group">
            <label>Log Level</label>
            <div className="checkbox-group">
              {levels.map(level => (
                <label key={level} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.level.includes(level)}
                    onChange={() => handleCheckboxFilter('level', level)}
                  />
                  <span className={getLevelClass(level)}>{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <div className="checkbox-group">
              {categories.map(category => (
                <label key={category} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(category)}
                    onChange={() => handleCheckboxFilter('category', category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="datetime-local"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="datetime-local"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>User Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={filters.userAddress}
              onChange={(e) => handleFilterChange('userAddress', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Endpoint</label>
            <input
              type="text"
              placeholder="/api/..."
              value={filters.endpoint}
              onChange={(e) => handleFilterChange('endpoint', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group full-width">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search in messages and details..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={applyFilters} className="btn-apply">
            Apply Filters
          </button>
          <button onClick={resetFilters} className="btn-reset">
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="logs-error">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="logs-loading">
          Loading logs...
        </div>
      )}

      {/* Logs Table */}
      {!loading && logs.length > 0 && (
        <>
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Level</th>
                  <th>Category</th>
                  <th>Message</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id} className={`log-row ${getLevelClass(log.level)}`}>
                    <td className="log-timestamp">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td>
                      <span className={`log-badge ${getLevelClass(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td>
                      <span className="log-category">{log.category}</span>
                    </td>
                    <td className="log-message">{log.message}</td>
                    <td className="log-address">
                      {log.userAddress ? `${log.userAddress.slice(0, 6)}...${log.userAddress.slice(-4)}` : '-'}
                    </td>
                    <td>
                      {log.statusCode && (
                        <span className={`status-code ${log.statusCode >= 400 ? 'error' : 'success'}`}>
                          {log.statusCode}
                        </span>
                      )}
                    </td>
                    <td>{log.duration ? `${log.duration}ms` : '-'}</td>
                    <td>
                      <button
                        className="btn-details"
                        onClick={() => setSelectedLog(log)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="logs-pagination">
            <div className="pagination-info">
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => loadLogs(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-page"
              >
                ← Previous
              </button>
              <span className="page-number">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => loadLogs(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-page"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {/* No logs */}
      {!loading && logs.length === 0 && (
        <div className="logs-empty">
          No logs found matching the current filters.
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="log-detail-overlay" onClick={() => setSelectedLog(null)}>
          <div className="log-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-detail-header">
              <h2>Log Details</h2>
              <button className="btn-close" onClick={() => setSelectedLog(null)}>
                ✕
              </button>
            </div>
            <div className="log-detail-content">
              <div className="detail-row">
                <span className="detail-label">Timestamp:</span>
                <span>{formatTimestamp(selectedLog.timestamp)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Level:</span>
                <span className={`log-badge ${getLevelClass(selectedLog.level)}`}>
                  {selectedLog.level}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span>{selectedLog.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Message:</span>
                <span>{selectedLog.message}</span>
              </div>
              
              {selectedLog.method && (
                <div className="detail-row">
                  <span className="detail-label">Request:</span>
                  <span>{selectedLog.method} {selectedLog.url}</span>
                </div>
              )}
              
              {selectedLog.statusCode && (
                <div className="detail-row">
                  <span className="detail-label">Status Code:</span>
                  <span className={selectedLog.statusCode >= 400 ? 'error' : 'success'}>
                    {selectedLog.statusCode}
                  </span>
                </div>
              )}
              
              {selectedLog.duration && (
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span>{selectedLog.duration}ms</span>
                </div>
              )}
              
              {selectedLog.userAddress && (
                <div className="detail-row">
                  <span className="detail-label">User Address:</span>
                  <span className="mono">{selectedLog.userAddress}</span>
                </div>
              )}
              
              {selectedLog.ip && (
                <div className="detail-row">
                  <span className="detail-label">IP:</span>
                  <span>{selectedLog.ip}</span>
                </div>
              )}
              
              {selectedLog.requestBody && (
                <div className="detail-section">
                  <div className="detail-label">Request Body:</div>
                  <pre className="detail-json">{formatJSON(selectedLog.requestBody)}</pre>
                </div>
              )}
              
              {selectedLog.requestQuery && Object.keys(selectedLog.requestQuery).length > 0 && (
                <div className="detail-section">
                  <div className="detail-label">Query Params:</div>
                  <pre className="detail-json">{formatJSON(selectedLog.requestQuery)}</pre>
                </div>
              )}
              
              {selectedLog.responseData && (
                <div className="detail-section">
                  <div className="detail-label">Response Data:</div>
                  <pre className="detail-json">{formatJSON(selectedLog.responseData)}</pre>
                </div>
              )}
              
              {selectedLog.details && (
                <div className="detail-section">
                  <div className="detail-label">Additional Details:</div>
                  <pre className="detail-json">{formatJSON(selectedLog.details)}</pre>
                </div>
              )}
              
              {selectedLog.error && (
                <div className="detail-section error">
                  <div className="detail-label">Error:</div>
                  <div className="error-message">{selectedLog.error.message}</div>
                  {selectedLog.error.stack && (
                    <pre className="error-stack">{selectedLog.error.stack}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
