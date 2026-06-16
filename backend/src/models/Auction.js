const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: [true,'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        startingPrice: {
            type: Number,
            required: [true,'Starting price is required'],
            min: 0,
        },
        currentPrice: {
            type: Number,
            default: 0,
        },
        highestBidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        imageUrl: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ['upcoming','live','ended','cancelled'],
            default: 'upcoming',
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
    },
    { timestamps : true }
);

auctionSchema.index({ status: 1 });
auctionSchema.index({ category: 1 });
auctionSchema.index({ sellerId: 1 });
auctionSchema.index({ status: 1,category: 1 });
auctionSchema.index({ title:'text',description:'text',category:'text'});
const Auction = mongoose.model('Auction',auctionSchema);
module.exports = Auction;