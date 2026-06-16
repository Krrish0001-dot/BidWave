import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axios';
import socket from '../socket/socket';
import toast from 'react-hot-toast';

const loadRazorpay = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const AuctionDetailPage = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [auction, setAuction] = useState(null);
    const [bids, setBids] = useState([]);
    const [bidAmount, setBidAmount] = useState('');
    const [viewerCount, setViewerCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState('');
    const [flashPrice, setFlashPrice] = useState(false);
    const [loading, setLoading] = useState(true);
    const [autoBidAmount, setAutoBidAmount] = useState('');
    const [autoBidEnabled, setAutoBidEnabled] = useState(false);
    const [settingAutoBid, setSettingAutoBid] = useState(false);
    const [showAutoBid, setShowAutoBid] = useState(false);
    const [paying, setPaying] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);

    const timerRef = useRef(null);

    const fetchBids = async () => {
        try {
            const res = await api.get(`/auctions/${id}/bids`);
            setBids(res.data.bid || []);
        } catch (err) {}
    };

    const fetchAuction = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/auctions/${id}`);
            const data = res.data.auction || res.data.data || res.data;
            setAuction(data);
            await fetchBids();
        } catch (err) {
            toast.error('Failed to load auction');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuction();
        return () => clearInterval(timerRef.current);
    }, [id]);

    useEffect(() => {
        if (!id) return;

        socket.connect();
        socket.emit('joinAuction', id);

        socket.on('newBid', (data) => {
            setAuction((prev) => (prev ? { ...prev, currentPrice: data.newPrice } : prev));
            setFlashPrice(true);
            setTimeout(() => setFlashPrice(false), 700);
            fetchBids();
        });

        socket.on('viewerCount', (data) => {
            setViewerCount(data.count);
        });

        return () => {
            socket.emit('leaveAuction', id);
            socket.off('newBid');
            socket.off('viewerCount');
            socket.disconnect();
        };
    }, [id]);

    useEffect(() => {
        if (!auction?.endTime) return;

        const updateTimer = () => {
            const diff = new Date(auction.endTime).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft('Auction ended');
                clearInterval(timerRef.current);
                return;
            }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);
        return () => clearInterval(timerRef.current);
    }, [auction?.endTime]);

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please login to place a bid');
            return;
        }
        const amount = Number(bidAmount);
        if (!amount || amount <= (auction?.currentPrice || auction?.startingPrice || 0)) {
            toast.error('Bid must be higher than the current price');
            return;
        }
        try {
            await api.post(`/auctions/${id}/bids`, { amount });
            toast.success('Bid placed!');
            setBidAmount('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place bid');
        }
    };

    const handleSetAutoBid = async (e) => {
        e.preventDefault();
        const maxAmount = Number(autoBidAmount);
        if (!maxAmount || maxAmount <= (auction?.currentPrice || auction?.startingPrice || 0)) {
            toast.error('Auto-bid max must be higher than the current price');
            return;
        }
        setSettingAutoBid(true);
        try {
            await api.post(`/auctions/${id}/autobids`, { maxAmount });
            setAutoBidEnabled(true);
            toast.success(`Auto-bid set up to ₹${maxAmount}`);
            setShowAutoBid(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to set auto-bid');
        } finally {
            setSettingAutoBid(false);
        }
    };

    const handlePayment = async () => {
        const loaded = await loadRazorpay();
        if (!loaded) {
            toast.error('Failed to load payment gateway. Check your connection.');
            return;
        }

        setPaying(true);
        try {
            const res = await api.post(`/auctions/${id}/payments/create-order`);
            const { order } = res.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'BidWave',
                description: `Payment for ${auction.title}`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        await api.post(`/auctions/${id}/payments/verify`, {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        setPaymentDone(true);
                        toast.success('Payment successful! 🎉');
                    } catch (err) {
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: { color: '#6366f1' },
                modal: {
                    ondismiss: () => setPaying(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                toast.error('Payment failed. Please try again.');
                setPaying(false);
            });
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initiate payment');
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <p className="text-gray-400">Loading auction...</p>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <p className="text-gray-400">Auction not found.</p>
            </div>
        );
    }

    const sellerId = auction.sellerId?._id || auction.sellerId;
    const isSeller = user && sellerId && sellerId.toString() === user._id?.toString();
    const canBid = isAuthenticated && !isSeller && auction.status === 'live';

    const highestBidderId = auction.highestBidder?._id || auction.highestBidder;
    const isWinner = isAuthenticated && user && highestBidderId &&
        highestBidderId.toString() === user._id?.toString();

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                    <motion.img
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        src={auction.imageUrl || 'https://placehold.co/600x400/111827/6366f1?text=No+Image'}
                        alt={auction.title}
                        className="w-full h-80 object-cover rounded-2xl border border-gray-800"
                    />
                    <h1 className="text-2xl font-bold mt-5">{auction.title}</h1>
                    <p className="text-gray-400 mt-2">{auction.description}</p>

                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <span className={`px-3 py-1 rounded-full capitalize font-medium ${
                            auction.status === 'live'
                                ? 'bg-green-900/40 text-green-400'
                                : auction.status === 'upcoming'
                                ? 'bg-blue-900/40 text-blue-400'
                                : 'bg-gray-800 text-gray-400'
                        }`}>
                            {auction.status}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {viewerCount} watching
                        </span>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit">
                    <p className="text-gray-400 text-sm">Current Price</p>
                    <motion.p
                        animate={flashPrice ? { color: ['#818cf8', '#34d399', '#818cf8'] } : {}}
                        transition={{ duration: 0.7 }}
                        className="text-4xl font-bold text-indigo-400"
                    >
                        ₹{auction.currentPrice || auction.startingPrice}
                    </motion.p>

                    <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-gray-400">Time left</span>
                        <span className="font-semibold text-amber-400">{timeLeft}</span>
                    </div>

                    {canBid && (
                        <>
                            <form onSubmit={handlePlaceBid} className="mt-6 flex gap-3">
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder="Enter your bid"
                                    className="flex-1 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors active:scale-95"
                                >
                                    Place Bid
                                </button>
                            </form>

                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAutoBid(!showAutoBid)}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                                        autoBidEnabled
                                            ? 'bg-green-900/30 border-green-700 text-green-400'
                                            : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-indigo-500 hover:text-white'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${autoBidEnabled ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                                        {autoBidEnabled ? 'Auto-bid is active' : 'Set auto-bid'}
                                    </span>
                                    <span className="text-xs opacity-60">{showAutoBid ? '▲' : '▼'}</span>
                                </button>

                                <AnimatePresence>
                                    {showAutoBid && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <form
                                                onSubmit={handleSetAutoBid}
                                                className="mt-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-3"
                                            >
                                                <p className="text-xs text-gray-400">
                                                    BidWave will automatically outbid others on your behalf, up to your maximum amount.
                                                </p>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="number"
                                                        value={autoBidAmount}
                                                        onChange={(e) => setAutoBidAmount(e.target.value)}
                                                        placeholder="Your max amount"
                                                        className="flex-1 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={settingAutoBid}
                                                        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-green-900 transition-colors text-sm active:scale-95"
                                                    >
                                                        {settingAutoBid ? 'Saving...' : 'Activate'}
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}

                    {auction.status === 'ended' && isWinner && (
                        <div className="mt-6">
                            {paymentDone ? (
                                <div className="p-4 bg-green-900/30 border border-green-700 rounded-xl text-center">
                                    <p className="text-green-400 font-semibold">Payment Complete</p>
                                    <p className="text-gray-400 text-sm mt-1">Thank you for your purchase!</p>
                                </div>
                            ) : (
                                <div className="p-4 bg-indigo-900/20 border border-indigo-700 rounded-xl">
                                    <p className="text-indigo-300 font-semibold mb-1">You won this auction!</p>
                                    <p className="text-gray-400 text-sm mb-4">Complete your purchase to claim the item.</p>
                                    <button
                                        onClick={handlePayment}
                                        disabled={paying}
                                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 transition-colors font-medium active:scale-95"
                                    >
                                        {paying ? 'Opening payment...' : `Pay ₹${auction.currentPrice}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {auction.status === 'ended' && !isWinner && !isSeller && isAuthenticated && (
                        <p className="mt-6 text-center text-sm text-gray-500">This auction has ended.</p>
                    )}

                    {!isAuthenticated && auction.status === 'live' && (
                        <p className="mt-6 text-center text-sm text-gray-400">
                            <a href="/login" className="text-indigo-400 hover:underline">Log in</a> to place a bid
                        </p>
                    )}

                    {isSeller && (
                        <p className="mt-6 text-center text-sm text-gray-500">You are the seller of this auction.</p>
                    )}

                    <div className="mt-6">
                        <p className="text-sm text-gray-400 mb-2">Recent bids</p>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            <AnimatePresence initial={false}>
                                {bids.map((bid, i) => (
                                    <motion.div
                                        key={bid._id || `${bid.amount}-${i}`}
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-2 text-sm"
                                    >
                                        <span className="text-gray-300">
                                            {bid.bidderId?.name || 'Bidder'}
                                        </span>
                                        <span className="font-semibold text-indigo-400">₹{bid.amount}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {bids.length === 0 && (
                                <p className="text-gray-500 text-sm">No bids yet. Be the first!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionDetailPage;