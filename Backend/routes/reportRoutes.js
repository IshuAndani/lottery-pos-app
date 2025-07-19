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

// --- Agent Report Route ---
router.get(
  '/agent/dashboard', 
  restrictTo('agent'), 
  reportController.getAgentReport
);

module.exports = router;