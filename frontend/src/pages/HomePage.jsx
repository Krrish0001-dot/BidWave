import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const HomePage = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAuctions();
    }, []);

    const fetchAuctions = async (searchTerm = '') => {
        try {
            setLoading(true);
            const url = searchTerm
                ? `/auctions?search=${encodeURIComponent(searchTerm)}`
                : '/auctions';
            const res = await api.get(url);
            setAuctions(res.data.auctions || res.data.data || res.data);
        } catch (err) {
            toast.error('Failed to load auctions');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAuctions(search);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-7xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-3xl font-bold mb-6"
                >
                    Live Auctions
                </motion.h1>

                <form onSubmit={handleSearch} className="mb-8 flex gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search auctions..."
                        className="flex-1 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors active:scale-95"
                    >
                        Search
                    </button>
                </form>

                {loading ? (
                    <p className="text-gray-400">Loading auctions...</p>
                ) : auctions.length === 0 ? (
                    <p className="text-gray-400">No auctions found.</p>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.07 } },
                        }}
                    >
                        {auctions.map((auction) => (
                            <motion.div
                                key={auction._id}
                                variants={{
                                    hidden: { opacity: 0, y: 15 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                whileHover={{ y: -6 }}
                                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-indigo-900/40 transition-shadow"
                            >
                                <Link to={`/auctions/${auction._id}`}>
                                    <img
                                        src={auction.imageUrl || 'https://placehold.co/400x250/111827/6366f1?text=No+Image'}
                                        alt={auction.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold truncate">{auction.title}</h2>
                                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{auction.description}</p>
                                        <div className="mt-3 flex items-center justify-between">
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
                )}
            </div>
        </div>
    );
};

export default HomePage;