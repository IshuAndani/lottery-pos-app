const express = require('express');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(protect);

router.get('/', (req, res) => {
    const printers = [
        { id: 'p1', name: 'Epson TM-T88V' },
        { id: 'p2', name: 'Star Micronics TSP100' },
        { id: 'p3', name: 'Generic Thermal Printer' },
    ];
    res.status(200).json({ status: 'success', data: { printers } });
});

module.exports = router;