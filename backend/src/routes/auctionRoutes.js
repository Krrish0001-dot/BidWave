const express = require('express');
const router = express.Router();
const { createAuction, getMyAuctions, getAllAuctions, getAuction, updateAuction, deleteAuction } = require('../controllers/auctionController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/roles');
const upload = require('../utils/uploadToS3');

router.get('/my-auctions', protect, getMyAuctions);
router.get('/', getAllAuctions);
router.get('/:id', getAuction);
router.post('/', protect, restrictTo('seller'), upload.single('image'), createAuction);
router.put('/:id', protect, restrictTo('seller'), upload.single('image'), updateAuction);
router.delete('/:id', protect, restrictTo('seller'), deleteAuction);

module.exports = router;