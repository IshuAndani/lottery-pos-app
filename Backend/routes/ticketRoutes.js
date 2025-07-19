const express = require('express');
const ticketController = require('../controllers/ticketController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Only Agents can access these routes
router.use(restrictTo('agent'));

router.route('/')
  .post(ticketController.createTicket);

router.get('/:ticketId', ticketController.getTicketByTicketId);

router.post('/:ticketId/payout', ticketController.payoutWinningTicket);

module.exports = router;