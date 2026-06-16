const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true,
    },
    buyerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    sellerId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    amount: {
        type:Number,
        required: true,
    },
    razorpayOrderId:{
        type:String,
        required: true,
    },
    razorpayPaymentId:{
        type: String,
    },
    razorpaySignature: {
        type:String,
    },
    status:{
        type: String,
        enum: ['pending','completed','failed'],
        default: 'pending',
    },
}, {timestamps: true });

const Payment = mongoose.model('Payment',paymentSchema);
module.exports = Payment;