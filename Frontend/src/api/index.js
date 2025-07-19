import axios from 'axios';

/**
 * Create a configured instance of Axios.
 * This instance will be used for all API requests throughout the application.
 */
const apiClient = axios.create({
  // Set the base URL for all API requests to your backend server.
  // Make sure your backend is running on this address.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  
  // This is CRUCIAL for cookie-based authentication.
  // It tells Axios to send cookies received from the backend
  // back to the backend on subsequent requests.
  withCredentials: true,
});

/**
 * =================================================================
 * AUTHENTICATION API CALLS
 * =================================================================
 */

/**
 * Sends a login request to the backend.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The response data from the server.
 */
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/users/login', { email, password });
    return response.data;
  } catch (error) {
    // Axios wraps the error from the server in error.response.
    // We re-throw it to be handled by the component that called this function.
    throw error.response.data || new Error('Network error during login');
  }
};

export const logoutUser = async () => {
  try {
    // The backend route is GET /api/v1/users/logout
    const response = await apiClient.get('/users/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Logout failed');
  }
};

/**
 * Fetches the currently authenticated user's data.
 * The browser automatically sends the httpOnly cookie.
 * @returns {Promise<Object>} The user data.
 */
export const getCurrentUser = async () => {
  try {
    // This endpoint should be protected by your 'protect' middleware on the backend
    // and return the user object if the cookie is valid.
    const response = await apiClient.get('/users/me');
    return response.data.data.user;
  } catch (error) {
    // This will fail if the user is not logged in (e.g., 401 Unauthorized)
    throw error.response?.data || new Error('Not authenticated');
  }
};
/**
 * =================================================================
 * LOTTERY API CALLS
 * =================================================================
 */

/**
 * Fetches all lotteries with 'open' status.
 * @returns {Promise<Array>} A list of open lotteries.
 */
export const getOpenLotteries = async () => {
  try {
    // The backend route GET /api/v1/lotteries?status=open handles the filtering.
    const response = await apiClient.get('/lotteries?status=open');
    console.log(response);
    return response.data.data.lotteries;
  } catch (error) {
    throw error.response.data || new Error('Failed to fetch open lotteries');
  }
};

/**
 * Fetches the details for a single lottery by its ID.
 * @param {string} lotteryId - The ID of the lottery.
 * @returns {Promise<Object>} The lottery data.
 */
export const getLotteryById = async (lotteryId) => {
  try {
    // Note: The backend doesn't have a dedicated single lottery route yet.
    // We will assume it's GET /api/v1/lotteries/:id for now and build it on the backend if needed.
    // For now, we'll filter from the open lotteries list on the frontend.
    // THIS IS A TEMPORARY WORKAROUND.
    const lotteries = await getOpenLotteries();
    const lottery = lotteries.find(l => l._id === lotteryId);
    if (!lottery) throw new Error('Lottery not found');
    return lottery;
  } catch (error) {
    throw error.response?.data || error || new Error('Failed to fetch lottery details');
  }
};

/**
 * Fetches a list of sold numbers for a specific lottery.
 * @param {string} lotteryId - The ID of the lottery.
 * @returns {Promise<Array>} A list of sold number strings.
 */
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

/**
 * Creates a new ticket.
 * @param {Object} ticketData - The data for the new ticket.
 * @returns {Promise<Object>} The created ticket data.
 */
export const createTicket = async (ticketData) => {
  try {
    const response = await apiClient.post('/tickets', ticketData);
    return response.data.data.ticket;
  } catch (error) {
    throw error.response.data || new Error('Failed to create ticket');
  }
};

/**
 * Fetches a ticket's details by its human-readable ticketId.
 * @param {string} ticketId - The ID of the ticket to check.
 * @returns {Promise<Object>} The ticket data.
 */
export const getTicketById = async (ticketId) => {
  try {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data.data.ticket;
  } catch (error) {
    throw error.response.data || new Error('Failed to fetch ticket');
  }
};

/**
 * Processes the payout for a winning ticket.
 * @param {string} ticketId - The ID of the ticket to pay out.
 * @returns {Promise<Object>} The updated ticket data.
 */
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

/**
 * Fetches the report/dashboard data for the logged-in agent.
 * Can optionally filter by a date range.
 * @param {Object} [params] - Optional query parameters (startDate, endDate).
 * @returns {Promise<Object>} The agent's report data.
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

export const getAllLotteriesAdmin = async () => {
  try {
    // Fetch all lotteries regardless of status
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
    const response = await apiClient.post(`/lotteries/${lotteryId}/declare-winners`, { winningNumbers });
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
  } catch (error)
 {
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