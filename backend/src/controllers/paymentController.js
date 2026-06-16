const Razorpay = require('razorpay');
const crypto = require('node:crypto');
const Payment = require('../models/Payment');
const Auction = require('../models/Auction');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);

        if (!auction) {
            return res.status(404).json({ success: false, message: 'Auction not found' });
        }
        if (auction.status !== 'ended') {
            return res.status(400).json({ success: false, message: 'Auction has not ended yet' });
        }
        if (auction.highestBidder.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only the winning bidder can make payment' });
        }

        const order = await razorpay.orders.create({
            amount: auction.currentPrice * 100,
            currency: 'INR',
            receipt: `auction_${auction._id}`,
        });

        const payment = await Payment.create({
            auctionId: auction._id,
            buyerId: req.user.id,
            sellerId: auction.sellerId,
            amount: auction.currentPrice,
            razorpayOrderId: order.id,
        });

        res.status(201).json({ success: true, order, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        const payment = await Payment.findOneAndUpdate(
            { razorpayOrderId },
            { razorpayPaymentId, razorpaySignature, status: 'completed' },
            { new: true }
        );

        res.json({ success: true, message: 'Payment verified successfully', payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createOrder, verifyPayment };