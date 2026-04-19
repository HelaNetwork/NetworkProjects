const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class LogsAPIService {
  /**
   * Query logs with filters
   */
  async getLogs({
    level,
    category,
    startDate,
    endDate,
    userAddress,
    endpoint,
    search,
    tags,
    page = 1,
    limit = 50,
    sortBy = 'timestamp',
    sortOrder = 'desc',
    walletAddress, // Admin wallet address for authentication
  }) {
    try {
      const params = new URLSearchParams();
      
      if (level && (Array.isArray(level) ? level.length > 0 : true)) {
        params.append('level', Array.isArray(level) ? level.join(',') : level);
      }
      if (category && (Array.isArray(category) ? category.length > 0 : true)) {
        params.append('category', Array.isArray(category) ? category.join(',') : category);
      }
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (userAddress) params.append('userAddress', userAddress);
      if (endpoint) params.append('endpoint', endpoint);
      if (search) params.append('search', search);
      if (tags && (Array.isArray(tags) ? tags.length > 0 : true)) {
        params.append('tags', Array.isArray(tags) ? tags.join(',') : tags);
      }
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (walletAddress) {
        headers['X-Wallet-Address'] = walletAddress;
      }

      const res = await fetch(`${API_BASE_URL}/logs?${params}`, {
        headers,
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch logs');
      }
      
      return data;
    } catch (err) {
      console.error('Get logs error:', err);
      throw err;
    }
  }

  /**
   * Get log statistics
   */
  async getStats({ startDate, endDate, walletAddress }) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (walletAddress) {
        headers['X-Wallet-Address'] = walletAddress;
      }

      const res = await fetch(`${API_BASE_URL}/logs/stats?${params}`, {
        headers,
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stats');
      }
      
      return data.stats;
    } catch (err) {
      console.error('Get stats error:', err);
      throw err;
    }
  }

  /**
   * Export logs
   */
  async exportLogs({
    level,
    category,
    startDate,
    endDate,
    userAddress,
    endpoint,
    search,
    tags,
    limit = 1000,
    walletAddress,
  }) {
    try {
      const params = new URLSearchParams();
      
      if (level && (Array.isArray(level) ? level.length > 0 : true)) {
        params.append('level', Array.isArray(level) ? level.join(',') : level);
      }
      if (category && (Array.isArray(category) ? category.length > 0 : true)) {
        params.append('category', Array.isArray(category) ? category.join(',') : category);
      }
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (userAddress) params.append('userAddress', userAddress);
      if (endpoint) params.append('endpoint', endpoint);
      if (search) params.append('search', search);
      if (tags && (Array.isArray(tags) ? tags.length > 0 : true)) {
        params.append('tags', Array.isArray(tags) ? tags.join(',') : tags);
      }
      if (limit) params.append('limit', limit);

      const headers = {};
      if (walletAddress) {
        headers['X-Wallet-Address'] = walletAddress;
      }

      const res = await fetch(`${API_BASE_URL}/logs/export?${params}`, {
        headers,
      });
      
      if (!res.ok) {
        throw new Error('Failed to export logs');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      console.error('Export logs error:', err);
      throw err;
    }
  }

  /**
   * Delete old logs
   */
  async cleanupLogs({ daysToKeep = 90, walletAddress }) {
    try {
      const params = new URLSearchParams();
      if (daysToKeep) params.append('daysToKeep', daysToKeep);

      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (walletAddress) {
        headers['X-Wallet-Address'] = walletAddress;
      }

      const res = await fetch(`${API_BASE_URL}/logs/cleanup?${params}`, {
        method: 'DELETE',
        headers,
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to cleanup logs');
      }
      
      return data;
    } catch (err) {
      console.error('Cleanup logs error:', err);
      throw err;
    }
  }

  /**
   * Get available log levels
   */
  async getLevels(walletAddress) {
    try {
      const headers = {};
      if (walletAddress) {
        headers['X-Wallet-Address'] = walletAddress;
      }

      const res = await fetch(`${API_BASE_URL}/logs/levels`, {
        headers,
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch levels');
      }
      
      return data.levels;
    } catch (err) {
      console.error('Get levels error:', err);
      throw err;
    }
  }

  /**
   * Get available log categories
   */
  async getCategories(walletAddress) {
    try {
      const headers = {};
      if (walletAddress) {
        headers['X-Wallet-Address'] = walletAddress;
      }

      const res = await fetch(`${API_BASE_URL}/logs/categories`, {
        headers,
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch categories');
      }
      
      return data.categories;
    } catch (err) {
      console.error('Get categories error:', err);
      throw err;
    }
  }
}

export default new LogsAPIService();
