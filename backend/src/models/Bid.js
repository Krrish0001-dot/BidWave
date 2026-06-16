const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true,
    },
    bidderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    isWinningBid:{
        type: Boolean,
        default: false,
    },
    ipAddress: {
        type: String,
    },
},{ timestamps: true });

bidSchema.index({ auctionId: 1, amount: -1});

const Bid = mongoose.model('Bid',bidSchema);
module.exports = Bid;