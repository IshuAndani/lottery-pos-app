const express = require('express');
const lotteryController = require('../controllers/lotteryController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(lotteryController.getAllLotteries) // Agents and Admins can view lotteries
  .post(restrictTo('admin'), lotteryController.createLottery); // Only Admins can create

router.route('/:id')
  .patch(restrictTo('admin'), lotteryController.updateLottery) // Only Admins can update
  .delete(restrictTo('admin'), lotteryController.deleteLottery); // Only Admins can delete

router.get('/:id/sold-numbers', lotteryController.getSoldNumbers);

router.post('/:id/declare-winners', restrictTo('admin'), lotteryController.declareWinners);

// Admin-only endpoint to recalculate winners for a completed lottery using existing winning numbers
router.post('/:id/recalculate-winners', restrictTo('admin'), lotteryController.recalculateWinners);

module.exports = router;