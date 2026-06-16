const mongoose = require('mongoose');

const autoBidSchema = new mongoose.Schema({
    auctionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Auction',
        required: true,
    },
    bidderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    maxAmount: {
        type: Number,
        required: true,
    },
    isActive: {
        type:Boolean,
        default: true,
    },
},{ timestamps: true });

autoBidSchema.index({ auctionId:1,bidderId:1},{unique:true});

const AutoBid = mongoose.model('AutoBid',autoBidSchema);
module.exports = AutoBid;