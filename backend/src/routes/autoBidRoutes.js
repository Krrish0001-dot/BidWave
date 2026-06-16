const express = require('express');
const router = express.Router({ mergeParams: true });
const{ setAutoBid } = require('../controllers/autoBidController');
const{ protect } = require('../middleware/auth');
const{ restrictTo } = require('../middleware/roles');

router.post('/',protect,restrictTo('buyer'),setAutoBid);

module.exports = router;