const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const redlock = require('../utils/redlock');
const { processAutoBids } = require('./autoBidController');

const placeBid = async (req,res) => {
    const lockKey = `lock:auction:${req.params.id}`;
    let lock;
    try{
        lock = await redlock.acquire([lockKey],5000);
        const auction = await Auction.findById(req.params.id);

        if(!auction){
            return res.status(404).json({ success:false,message:'Auction not found'});
        }
        if(auction.status !== 'live'){
            return res.status(400).json({success: false,message:'Auction is not live'});
        }
        if(auction.sellerId.toString() === req.user.id){
            return res.status(403).json({success:false,message:'Seller cannot bid on their own auction'});
        }

        const { amount } = req.body;

        if(!amount){
            return res.status(400).json({ success:false,message:'Please provide bid amount'});
        }
        if(amount <= auction.currentPrice){
            return res.status(400).json({success:false,message:`Bid must be higher than current price: ${auction.currentPrice}`});
        }
        const bid = await Bid.create({
            auctionId: auction._id,
            bidderId: req.user.id,
            amount,
            ipAddress: req.ip,
        });

        auction.currentPrice = amount;
        auction.highestBidder = req.user.id;
        await auction.save();

        const io = req.app.get('io');
        io.to(auction._id.toString()).emit('newBid',{
            auctionId: auction._id,
            newPrice: amount,
            bidderId: req.user.id,
            bidId: bid._id,
        });

        processAutoBids(auction._id,amount,req.user.id,io);

        res.status(201).json({success:true,message: 'Bid placed successfully',bid});

    } catch (error) {
        res.status(500).json({success:false,message: error.message});
    } finally{
        if(lock) await lock.release();
    }
};

const getAuctionBids = async(req,res) => {
    try{
        const bid = await Bid.find({auctionId: req.params.id})
        .populate('bidderId','name email')
        .sort({ amount: -1});

        res.json({ success:true,count:bid.length,bid});
    } catch(error) {
        res.status(500).json({success:false,message:error.message});
    }
};

const getMyBids = async (req, res) => {
    try {
        const bids = await Bid.find({ bidderId: req.user.id })
            .populate('auctionId', 'title currentPrice status imageUrl')
            .sort({ createdAt: -1 });

        const formatted = bids.map(b => {
            const obj = b.toObject();
            obj.auction = obj.auctionId;
            delete obj.auctionId;
            return obj;
        });

        res.json({ success: true, bids: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { placeBid, getAuctionBids, getMyBids };