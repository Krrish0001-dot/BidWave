const express = require('express');
const router = express.Router({ mergeParams: true });
const { createOrder,verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');

router.post('/create-order',protect,restrictTo('buyer'),createOrder);
router.post('/verify',protect,restrictTo('buyer'),verifyPayment);

module.exports = router;