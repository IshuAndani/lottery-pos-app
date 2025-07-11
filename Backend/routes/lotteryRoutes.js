const express = require('express');
const lotteryController = require('../controllers/lotteryController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(lotteryController.getAllLotteries) // Agents and Admins can view lotteries
  .post(restrictTo('admin'), lotteryController.createLottery); // Only Admins can create

router.get('/:id/sold-numbers',lotteryController.getSoldNumbers);

router.post('/:id/declare-winners', restrictTo('admin'), lotteryController.declareWinners);

module.exports = router;