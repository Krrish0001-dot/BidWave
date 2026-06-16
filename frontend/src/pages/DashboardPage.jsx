import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [myAuctions, setMyAuctions] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [tab, setTab] = useState('auctions');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [auctionsRes, bidsRes] = await Promise.allSettled([
                api.get('/auctions/my-auctions'),
                api.get('/bids/my-bids'),
            ]);

            if (auctionsRes.status === 'fulfilled') {
                setMyAuctions(auctionsRes.value.data.auctions || auctionsRes.value.data.data || auctionsRes.value.data);
            }
            if (bidsRes.status === 'fulfilled') {
                setMyBids(bidsRes.value.data.bids || bidsRes.value.data.data || bidsRes.value.data);
            }
        } catch (err) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-3xl font-bold"
                    >
                        Welcome, {user?.name || user?.username || 'there'}
                    </motion.h1>
                    <Link
                        to="/create-auction"
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors active:scale-95"
                    >
                        + Create Auction
                    </Link>
                </div>

                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setTab('auctions')}
                        className={`px-4 py-2 rounded-xl transition-colors ${
                            tab === 'auctions' ? 'bg-indigo-600' : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                    >
                        My Auctions
                    </button>
                    <button
                        onClick={() => setTab('bids')}
                        className={`px-4 py-2 rounded-xl transition-colors ${
                            tab === 'bids' ? 'bg-indigo-600' : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                    >
                        My Bids
                    </button>
                </div>

                {loading ? (
                    <p className="text-gray-400">Loading...</p>
                ) : tab === 'auctions' ? (
                    myAuctions.length === 0 ? (
                        <p className="text-gray-400">You haven't created any auctions yet.</p>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                        >
                            {myAuctions.map((auction) => (
                                <motion.div
                                    key={auction._id}
                                    variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -6 }}
                                    className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg"
                                >
                                    <Link to={`/auctions/${auction._id}`}>
                                        <img
                                            src={auction.imageUrl || 'https://placehold.co/400x250/111827/6366f1?text=No+Image'}
                                            alt={auction.title}
                                            className="w-full h-44 object-cover"
                                        />
                                        <div className="p-4">
                                            <h2 className="text-lg font-semibold truncate">{auction.title}</h2>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-indigo-400 font-bold">
                                                    ₹{auction.currentPrice ?? auction.startingPrice}
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 capitalize">
                                                    {auction.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )
                ) : myBids.length === 0 ? (
                    <p className="text-gray-400">You haven't placed any bids yet.</p>
                ) : (
                    <div className="space-y-3">
                        {myBids.map((bid) => (
                            <motion.div
                                key={bid._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div>
                                    <Link
                                        to={`/auctions/${bid.auction?._id || bid.auction}`}
                                        className="font-semibold hover:text-indigo-400 transition-colors"
                                    >
                                        {bid.auction?.title || 'Auction'}
                                    </Link>
                                    <p className="text-sm text-gray-400">
                                        Bid amount: ₹{bid.amount}
                                    </p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 capitalize">
                                    {bid.status || 'placed'}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;