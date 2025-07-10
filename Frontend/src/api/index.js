import axios from 'axios';

/**
 * Create a configured instance of Axios.
 * This instance will be used for all API requests throughout the application.
 */
const apiClient = axios.create({
  // Set the base URL for all API requests to your backend server.
  // Make sure your backend is running on this address.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
});

/**
 * This request interceptor adds the JWT token from localStorage to the
 * Authorization header of every outgoing request.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


/**
 * This interceptor is the key to robust error handling. It catches all
 * failed API calls and standardizes the error message before it reaches
 * your components.
 */
apiClient.interceptors.response.use(
  // Any status code within the 2xx range will just pass through.
  (response) => response,
  // Any status code outside the 2xx range will trigger this function.
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // The request was made and the server responded with a status code
      // (e.g., 401, 404, 500). We can use the message from the server.
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
      // The request was made but no response was received. This is a network error.
      errorMessage = 'Cannot connect to the server. Please check your network connection.';
    } else {
      // Something else happened in setting up the request that triggered an Error.
      errorMessage = error.message;
    }

    // We reject the promise with a new Error object, ensuring a consistent
    // error structure (`err.message`) in all .catch() blocks.
    return Promise.reject(new Error(errorMessage));
  }
);

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
  const response = await apiClient.post('/users/login', { email, password });
  // Assuming the backend now returns a token in the response body
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logoutUser = async () => {
  // Remove the token from localStorage. The API call is secondary.
  localStorage.removeItem('token');
  // The interceptor will handle any errors from the API call.
  const response = await apiClient.get('/users/logout');
  return response.data;
};

/**
 * Fetches the currently authenticated user's data.
 * The request interceptor automatically adds the Authorization header.
 * @returns {Promise<Object>} The user data.
 */
export const getCurrentUser = async () => {
  // If there's no token, we don't need to make an API call.
  const token = localStorage.getItem('token');
  if (!token) {
    return Promise.reject(new Error('No token found.'));
  }
  // This endpoint is protected by the 'protect' middleware on the backend
  // and will return the user object if the token is valid.
  const response = await apiClient.get('/users/me');
  return response.data.data.user;
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
  // The interceptor will automatically handle errors and format them.
  const response = await apiClient.get('/lotteries?status=open');
  return response.data.data.lotteries;
};

/**
 * Fetches the details for a single lottery by its ID.
 * @param {string} lotteryId - The ID of the lottery.
 * @returns {Promise<Object>} The lottery data.
 */
export const getLotteryById = async (lotteryId) => {
  // THIS IS A TEMPORARY WORKAROUND until a dedicated backend route exists.
  // The `getOpenLotteries` call is protected by the interceptor.
  const lotteries = await getOpenLotteries();
  const lottery = lotteries.find((l) => l._id === lotteryId);
  if (!lottery)
    throw new Error(`Lottery with ID ${lotteryId} not found or is not open.`);
  return lottery;
};

/**
 * Fetches a list of sold numbers for a specific lottery.
 * @param {string} lotteryId - The ID of the lottery.
 * @returns {Promise<Array>} A list of sold number strings.
 */
export const getSoldNumbersForLottery = async (lotteryId) => {
  const response = await apiClient.get(`/lotteries/${lotteryId}/sold-numbers`);
  return response.data.data.soldNumbers;
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
  const response = await apiClient.post('/tickets', ticketData);
  return response.data.data;
};

/**
 * Fetches a ticket's details by its human-readable ticketId.
 * @param {string} ticketId - The ID of the ticket to check.
 * @returns {Promise<Object>} The ticket data.
 */
export const getTicketById = async (ticketId) => {
  const response = await apiClient.get(`/tickets/${ticketId}`);
  return response.data.data.ticket;
};

/**
 * Processes the payout for a winning ticket.
 * @param {string} ticketId - The ID of the ticket to pay out.
 * @returns {Promise<Object>} The updated ticket data.
 */
export const payoutTicket = async (ticketId) => {
  const response = await apiClient.post(`/tickets/${ticketId}/payout`);
  return response.data;
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
  const response = await apiClient.get('/reports/agent/dashboard', { params });
  return response.data.data.report;
};


/**
 * ADMIN API CALLS
 */
export const getAllAgents = async () => {
  const response = await apiClient.get('/users/agents');
  return response.data.data.agents;
};

export const createAgent = async (agentData) => {
  const response = await apiClient.post('/users/agents', agentData);
  return response.data.data.agent;
};

export const updateAgent = async (agentId, agentData) => {
  const response = await apiClient.patch(`/users/agents/${agentId}`, agentData);
  return response.data.data.agent;
};

export const getAllLotteriesAdmin = async () => {
  // Fetch all lotteries regardless of status
  const response = await apiClient.get('/lotteries');
  return response.data.data.lotteries;
};

export const createLottery = async (lotteryData) => {
  const response = await apiClient.post('/lotteries', lotteryData);
  return response.data.data.lottery;
};

export const declareWinners = async (lotteryId, winningNumbers) => {
  const response = await apiClient.post(`/lotteries/${lotteryId}/declare-winners`, { winningNumbers });
  return response.data;
};

export const getLotteryFinancials = async (lotteryId) => {
  const response = await apiClient.get(`/reports/admin/lottery/${lotteryId}`);
  return response.data.data.report;
};

export const getSystemSummary = async (params) => {
  const response = await apiClient.get('/reports/admin/summary', { params });
  return response.data.data.report;
};

export const settleAgentBalance = async (agentId, settlementData) => {
  const response = await apiClient.post(`/users/agents/${agentId}/settle-balance`, settlementData);
  return response.data;
};

export const getPrinters = async () => {
  const response = await apiClient.get('/printers');
  return response.data.data.printers;
};

export default apiClient;