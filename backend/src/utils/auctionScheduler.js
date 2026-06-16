const cron = require('node-cron');
const Auction = require('../models/Auction');

const startAuctionScheduler = ()  => {
    cron.schedule('* * * * *',async () => {
        try{
            const now = new Date();

            await Auction.updateMany(
                { status: 'upcoming',startTime: { $lte: now }},
                { $set: { status: 'live'}}
            );

            await Auction.updateMany(
                { status: 'live', endTime: {$lte: now}},
                { $set: {status: 'ended'}}
            );
        } catch (error){
            console.error('Auction scheduler error:',error.message);
        }
    });
    console.log('Auction scheduler started');
};

module.exports = startAuctionScheduler;