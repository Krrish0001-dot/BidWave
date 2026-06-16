import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const CreateAuctionPage = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [form, setForm] = useState({
        title: '',
        description: '',
        startingPrice: '',
        category: '',
        startTime: '',
        endTime: '',
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title || !form.description || !form.startingPrice || !form.category || !form.startTime || !form.endTime) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('startingPrice', form.startingPrice);
            formData.append('category', form.category);
            formData.append('startTime', form.startTime);
            formData.append('endTime', form.endTime);
            if (image) formData.append('image', image);

            const res = await api.post('/auctions', formData);

            const created = res.data.auction || res.data.data || res.data;
            toast.success('Auction created!');
            navigate(`/auctions/${created._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create auction');
        } finally {
            setSubmitting(false);
        }
    };

    if (user && user.role !== 'seller') {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
                <p className="text-gray-400 text-center">
                    Only sellers can create auctions. Update your role from your profile settings to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-2xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-3xl font-bold mb-8"
                >
                    Create Auction
                </motion.h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Starting Price (₹)</label>
                            <input
                                type="number"
                                name="startingPrice"
                                value={form.startingPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">End Time</label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer cursor-pointer"
                        />
                        {preview && (
                            <motion.img
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={preview}
                                alt="Preview"
                                className="mt-3 w-full h-48 object-cover rounded-xl border border-gray-800"
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? 'Creating...' : 'Create Auction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAuctionPage;