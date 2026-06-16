const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../config/redis');

const createRateLimiter = (windowMs,max,message) => {
    return rateLimit({
        windowMs,
        max,
        message: {success: false,message },
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (...args) => redis.call(...args),
        }),
    });
};

const generalLimiter = createRateLimiter(
    15 * 60 * 1000,
    300,
    'Too many requests, please try again after 15 minutes'
);

const authLimiter = createRateLimiter(
    15 * 60 * 1000,
    5,
    'Too many logins attempts, please try again after 15 minutes'
);

const bidLimiter = createRateLimiter(
    60 * 1000,
    10,
    'Too many bids, please slow down'
);

module.exports = { generalLimiter,authLimiter,bidLimiter };