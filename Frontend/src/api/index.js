import axios from 'axios';

/**
 * Create a configured instance of Axios.
 * This instance will be used for all API requests throughout the application.
 */
const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || 'https://lottery-pos-app-bel1.onrender.com/api/v1',
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',

  // Removed withCredentials: true, since we are not using cookies anymore
});

// Add a request interceptor to attach the JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * =================================================================
 * AUTHENTICATION API CALLS
 * =================================================================
 */

export const loginUser = async (email, password) => {
  try {
    console.log("Logging in...");
    const response = await apiClient.post("/users/login", { email, password });
    if (response.data.token) {
      localStorage.setItem('jwt', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response.data || new Error('Network error during login');
  }
};

export const logoutUser = async () => {
  try {
    localStorage.removeItem('jwt');
    return { status: 'success' };
  } catch (error) {
    throw error.response?.data || new Error('Logout failed');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data.data.user;
  } catch (error) {
    throw error.response?.data || new Error('Not authenticated');
  }
};

/**
 * =================================================================
 * LOTTERY API CALLS
 * =================================================================
 */

export const getOpenLotteries = async () => {
  try {
    const response = await apiClient.get('/lotteries?status=open');
    console.log(response);
    return response.data.data.lotteries;
  } catch (error) {
    throw error.response.data || new Error('Failed to fetch open lotteries');
  }
};

export const getLotteryById = async (lotteryId) => {
  try {
    const lotteries = await getOpenLotteries();
    const lottery = lotteries.find(l => l._id === lotteryId);
    if (!lottery) throw new Error('Lottery not found');
    return lottery;
  } catch (error) {
    throw error.response?.data || error || new Error('Failed to fetch lottery details');
  }
};

export const getSoldNumbersForLottery = async (lotteryId) => {
  try {
    const response = await apiClient.get(`/lotteries/${lotteryId}/sold-numbers`);
    console.log(response);
    return response.data.data.soldNumbers;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch sold numbers');
  }
};

/**
 * TICKET API CALLS
 */

export const createTicket = async (ticketData) => {
  try {
    const response = await apiClient.post('/tickets', ticketData);
    return response.data.data.ticket;
  } catch (error) {
    throw error.response.data || new Error('Failed to create ticket');
  }
};

export const getTicketById = async (ticketId) => {
  try {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data.data.ticket;
  } catch (error) {
    throw error.response.data || new Error('Failed to fetch ticket');
  }
};

export const payoutTicket = async (ticketId) => {
  try {
    const response = await apiClient.post(`/tickets/${ticketId}/payout`);
    return response.data;
  } catch (error) {
    throw error.response.data || new Error('Failed to process payout');
  }
};

/**
 * REPORTING API CALLS
 */

export const getAgentReport = async (params) => {
  try {
    const response = await apiClient.get('/reports/agent/dashboard', { params });
    return response.data.data.report;
  } catch (error) {
    throw error.response.data || new Error('Failed to fetch agent report');
  }
};

/**
 * ADMIN API CALLS
 */

export const getAllAgents = async () => {
  try {
    const response = await apiClient.get('/users/agents');
    return response.data.data.agents;
  } catch (error) {
    throw error.response.data || new Error('Failed to fetch agents');
  }
};

export const createAgent = async (agentData) => {
  try {
    const response = await apiClient.post('/users/agents', agentData);
    return response.data.data.agent;
  } catch (error) {
    throw error.response.data || new Error('Failed to create agent');
  }
};

export const updateAgent = async (agentId, agentData) => {
  try {
    const response = await apiClient.patch(`/users/agents/${agentId}`, agentData);
    return response.data.data.agent;
  } catch (error) {
    throw error.response.data || new Error('Failed to update agent');
  }
};

export const deleteAgent = async (agentId) => {
  try {
    const response = await apiClient.delete(`/users/agents/${agentId}`);
    return response.data;
  } catch (error) {
    throw error.response.data || new Error('Failed to delete agent');
  }
};

export const getAllLotteriesAdmin = async () => {
  try {
    const response = await apiClient.get('/lotteries');
    return response.data.data.lotteries;
  } catch (error) {
    throw error.response.data || new Error('Failed to fetch lotteries');
  }
};

export const createLottery = async (lotteryData) => {
  try {
    const response = await apiClient.post('/lotteries', lotteryData);
    return response.data.data.lottery;
  } catch (error) {
    throw error.response.data || new Error('Failed to create lottery');
  }
};

export const declareWinners = async (lotteryId, winningNumbers) => {
  try {
    const response = await apiClient.post(`/lotteries/${lotteryId}/declareWinners`, { winningNumbers });
    return response.data;
  } catch (error) {
    throw error.response.data || new Error('Failed to declare winners');
  }
};

export const getLotteryFinancials = async (lotteryId) => {
  try {
    const response = await apiClient.get(`/reports/admin/lottery/${lotteryId}`);
    return response.data.data.report;
  } catch (error) {
    throw error.response.data || new Error('Failed to fetch lottery financials');
  }
};

export const getSystemSummary = async (params) => {
  try {
    const response = await apiClient.get('/reports/admin/summary', { params });
    return response.data.data.report;
  } catch (error) {
    throw error.response.data || new Error('Failed to fetch system summary');
  }
};

export const settleAgentBalance = async (agentId, settlementData) => {
  try {
    const response = await apiClient.post(`/users/agents/${agentId}/settle-balance`, settlementData);
    return response.data;
  } catch (error) {
    throw error.response.data || new Error('Failed to settle balance');
  }
};

export const getPrinters = async () => {
  try {
    const response = await apiClient.get('/printers');
    return response.data.data.printers;
  } catch (error) {
    throw error.response.data || new Error('Failed to fetch printers');
  }
};

export default apiClient;