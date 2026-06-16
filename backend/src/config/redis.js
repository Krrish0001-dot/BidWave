const Redis = require('ioredis');

const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    });

redis.on('connect', () => {
    console.log('Redis Connected');
});

redis.on('error', (error) => {
    console.error('Redis Error:', error.message);
});

module.exports = redis;