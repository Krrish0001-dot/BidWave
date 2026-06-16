const express = require('express');
const router = express.Router({ mergeParams: true });
const { placeBid, getAuctionBids } = require('../controllers/bidController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');
const { bidLimiter } = require('../middleware/rateLimiter');

router.post('/', protect, restrictTo('buyer'), bidLimiter, placeBid);
router.get('/', protect, getAuctionBids);

module.exports = router;