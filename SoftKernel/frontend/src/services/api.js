const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to build headers with wallet authentication
 */
function authHeaders(walletAddress) {
  const headers = { 'Content-Type': 'application/json' };
  if (walletAddress) {
    headers['X-Wallet-Address'] = walletAddress.toLowerCase();
  }
  return headers;
}

class APIService {
  // ========== Employee API ==========
  
  async getEmployees(employerAddress) {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employerAddress}`, {
        headers: authHeaders(employerAddress),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.employees;
    } catch (err) {
      console.error('Get employees error:', err);
      throw err;
    }
  }

  async addEmployee(employerAddress, walletAddress, metadata = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: authHeaders(employerAddress),
        body: JSON.stringify({
          employerAddress,
          walletAddress,
          ...metadata,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.employee;
    } catch (err) {
      console.error('Add employee error:', err);
      throw err;
    }
  }

  async bulkAddEmployees(employerAddress, employees) {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/bulk`, {
        method: 'POST',
        headers: authHeaders(employerAddress),
        body: JSON.stringify({
          employerAddress,
          employees,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.results;
    } catch (err) {
      console.error('Bulk add error:', err);
      throw err;
    }
  }

  async deleteEmployee(employerAddress, walletAddress) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/employees/address/${employerAddress}/${walletAddress}`,
        { method: 'DELETE', headers: authHeaders(employerAddress) }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error('Delete employee error:', err);
      throw err;
    }
  }

  async updateEmployee(id, metadata, walletAddress) {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PATCH',
        headers: authHeaders(walletAddress),
        body: JSON.stringify(metadata),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.employee;
    } catch (err) {
      console.error('Update employee error:', err);
      throw err;
    }
  }

  // ========== Stream API ==========
  
  async getStreams(employerAddress, status = null) {
    try {
      const url = new URL(`${API_BASE_URL}/streams/${employerAddress}`);
      if (status) url.searchParams.set('status', status);
      
      const res = await fetch(url, {
        headers: authHeaders(employerAddress),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.streams;
    } catch (err) {
      console.error('Get streams error:', err);
      throw err;
    }
  }

  async getStream(employerAddress, employeeAddress) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/streams/${employerAddress}/${employeeAddress}`,
        { headers: authHeaders(employerAddress) }
      );
      const data = await res.json();
      if (!data.success) {
        if (res.status === 404) return null;
        throw new Error(data.error);
      }
      return data.stream;
    } catch (err) {
      if (err.message === 'Stream not found') return null;
      console.error('Get stream error:', err);
      throw err;
    }
  }

  async createStream(streamData) {
    try {
      const res = await fetch(`${API_BASE_URL}/streams`, {
        method: 'POST',
        headers: authHeaders(streamData.employerAddress),
        body: JSON.stringify(streamData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.stream;
    } catch (err) {
      console.error('Create stream error:', err);
      throw err;
    }
  }

  async updateStreamStatus(employerAddress, employeeAddress, paused) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/streams/${employerAddress}/${employeeAddress}/status`,
        {
          method: 'PATCH',
          headers: authHeaders(employerAddress),
          body: JSON.stringify({ paused }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.stream;
    } catch (err) {
      console.error('Update stream status error:', err);
      throw err;
    }
  }

  async cancelStream(employerAddress, employeeAddress, cancellationTxHash = null) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/streams/${employerAddress}/${employeeAddress}/cancel`,
        {
          method: 'PATCH',
          headers: authHeaders(employerAddress),
          body: JSON.stringify({ cancellationTxHash }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.stream;
    } catch (err) {
      console.error('Cancel stream error:', err);
      throw err;
    }
  }

  async syncStream(employerAddress, employeeAddress, syncData) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/streams/${employerAddress}/${employeeAddress}/sync`,
        {
          method: 'PATCH',
          headers: authHeaders(employerAddress),
          body: JSON.stringify(syncData),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.stream;
    } catch (err) {
      console.error('Sync stream error:', err);
      throw err;
    }
  }

  // ========== Health Check ==========
  
  async healthCheck() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Health check error:', err);
      return { success: false, error: err.message };
    }
  }
}

export default new APIService();
