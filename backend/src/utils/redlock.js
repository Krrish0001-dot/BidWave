const {default : Redlock} = require('redlock');
const redis = require('../config/redis');

const redlock = new Redlock([redis], {
    retryCount: 3,
    retryDelay: 200,
    retryJitter: 100,
});

redlock.on('clientError', (error) => {
    console.error("Redlock error:",error.message);
});

module.exports = redlock;

    
