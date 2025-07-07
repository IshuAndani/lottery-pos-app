const express = require('express');
const authController = require('../controllers/authController');
const agentController = require('../controllers/agentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// --- Auth Routes ---
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/me', authMiddleware.protect, authController.getMe);
// --- Agent Management Routes (Admin only) ---
// All routes below are protected and restricted to admins
router.use(authMiddleware.protect, authMiddleware.restrictTo('admin'));

router.route('/agents')
  .post(agentController.createAgent)
  .get(agentController.getAllAgents);

router.route('/agents/:id')
  .patch(agentController.updateAgent);
  
router.patch('/agents/:id/deactivate', agentController.deactivateAgent);

router.post(
  '/agents/:id/settle-balance', 
  authMiddleware.restrictTo('admin'), 
  agentController.settleBalance
);

module.exports = router;