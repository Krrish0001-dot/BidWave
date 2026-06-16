const AutoBid = require('../models/AutoBid');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const redlock = require('../utils/redlock');

const setAutoBid = async(req,res) => {
    try{
        const auction = await Auction.findById(req.params.id);

        if(!auction){
            return res.status(404).json({ success:false,message:'Auction not found'});
        }
        if(auction.status !== 'live'){
            return res.status(400).json({ success:false,message:'Auction is not live'});
        }
        if(auction.sellerId.toString() === req.user.id){
            return res.status(403).json({ success:false,message: 'Seller cannot set auto bid'});
        }
        const { maxAmount } = req.body;

        if(!maxAmount){
            return res.status(400).json({ success:false,message:'Please provide max amount'});
        }
        if(maxAmount <= auction.currentPrice){
            return res.status(400).json({ success:false,message:`Max amount must be higher than current price: ${auction.currentPrice}`});
        }

        const autoBid = await AutoBid.findOneAndUpdate(
            { auctionId: req.params.id, bidderId: req.user.id },
            { maxAmount, isActive: true },
            { upsert: true, new: true }
        );
        res.status(201).json({ success:true,message:'Auto bid set successfully',autoBid});
    } catch(error) {
        res.status(500).json({ success:false,message:error.message});
    }
};


const processAutoBids = async (auctionId,currentPrice,lastBidderId,io) => {
    const lockKey = `lock:auction:${auctionId}`;
    let lock;

    try{
        lock = await redlock.acquire([lockKey],5000);

        const autoBids = await AutoBid.find({
            auctionId,
            isActive: true,
            maxAmount: {$gt: currentPrice},
            bidderId: {$ne: lastBidderId},
        }).sort({maxAmount:-1});

        if(autoBids.length === 0) return;

        const topAutoBid = autoBids[0];
        const newBidAmount = currentPrice + 1000;

        if(newBidAmount > topAutoBid.maxAmount) return;

        const bid = await Bid.create({
            auctionId,
            bidderId:topAutoBid.bidderId,
            amount: newBidAmount,
            ipAddress: 'auto-bid',
        });

        await Auction.findByIdAndUpdate(auctionId,{
            currentPrice: newBidAmount,
            highestBidder: topAutoBid.bidderId,
        });
        if(io){
            io.to(auctionId.toString()).emit('newBid',{
                auctionId,
                newPrice:newBidAmount,
                bidderId:topAutoBid.bidderId,
                bidId:bid._id,
                isAutoBid:true,
            });
        }
        await processAutoBids(auctionId,newBidAmount,topAutoBid.bidderId,io);
    } catch(error){
        console.error('Auto bid error:',error.message);
    } finally{
        if(lock) await lock.release();
    }
};

module.exports = { setAutoBid,processAutoBids };