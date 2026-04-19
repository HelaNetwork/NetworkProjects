import axios from 'axios';

// Create adapter for API calls
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors (like 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optional: window.location.href = '/'; 
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: async (email, password, role) => {
        const response = await api.post('/auth/login', { email, password, role });
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await api.get('/auth/user');
        return response.data;
    }
};

export const employeeAPI = {
    getAll: async () => {
        const response = await api.get('/employees');
        return response.data;
    },
    create: async (employeeData) => {
        const response = await api.post('/employees', employeeData);
        return response.data;
    },
    update: async (id, employeeData) => {
        const response = await api.put(`/employees/${id}`, employeeData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/employees/${id}`);
        return response.data;
    }
};

// Stream API
export const streamAPI = {
    getAll: async () => {
        const response = await api.get('/streams');
        return response.data;
    },
    getUserStreams: async (address) => {
        const response = await api.get(`/streams/user/${address}`);
        return response.data;
    },
    getStream: async (id) => {
        const response = await api.get(`/streams/${id}`);
        return response.data;
    },
    getTransactions: async () => {
        const response = await api.get('/streams/history/transactions');
        return response.data;
    },
    getUserTransactions: async (address) => {
        const response = await api.get(`/streams/history/transactions/${address}`);
        return response.data;
    },
    getContractStats: async () => {
        const response = await api.get('/streams/contract-stats/info');
        return response.data;
    },
    labelStream: async (streamId, label) => {
        const response = await api.post('/streams/label', { streamId, label });
        return response.data;
    },
    labelTransaction: async (txHash, label) => {
        const response = await api.post('/streams/transaction/label', { txHash, label });
        return response.data;
    }
};

// Tax API
export const taxAPI = {
    getTaxSettings: async () => {
        const response = await api.get('/tax');
        return response.data;
    },
    updateTaxAddress: async (taxAddress) => {
        const response = await api.post('/tax', { taxAddress });
        return response.data;
    },
    getTaxVault: async () => {
        const response = await api.get('/tax/vault');
        return response.data;
    }
};

export default api;
