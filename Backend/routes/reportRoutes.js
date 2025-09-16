const express = require('express');
const reportController = require('../controllers/reportController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// --- Admin Report Routes ---
router.get(
  '/admin/lottery/:lotteryId',
  restrictTo('admin'),
  reportController.getLotteryReport
);
router.get(
  '/admin/agents',
  restrictTo('admin'),
  reportController.getAgentsReport
);
router.get(
  '/admin/summary',
  restrictTo('admin'),
  reportController.getAdminSummaryReport
);
router.get(
  '/admin/agent-tickets',
  restrictTo('admin'),
  reportController.getAgentTicketsReport
);
router.get(
  '/admin/tickets-sold',
  restrictTo('admin'),
  reportController.getTicketsSoldByDate
);

// --- Agent Report Route ---
router.get(
  '/agent/dashboard',
  restrictTo('agent'),
  reportController.getAgentReport
);

router.get(
  '/agent/recent-tickets',
  restrictTo('agent'),
  reportController.getAgentRecentTickets
);

module.exports = router;