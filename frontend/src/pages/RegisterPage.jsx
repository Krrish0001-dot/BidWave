import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/axios'
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice'

function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('buyer')
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading } = useSelector((state) => state.auth)

    const handleSubmit = async (e) => {
        e.preventDefault()
        dispatch(loginStart())
        try {
            const res = await api.post('/auth/register', { name, email, password, role })
            dispatch(loginSuccess(res.data))
            toast.success('Account created successfully!')
            navigate('/')
        } catch (error) {
            dispatch(loginFailure(error.response?.data?.message || 'Registration failed'))
            toast.error(error.response?.data?.message || 'Registration failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md"
            >
                <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
                <p className="text-gray-400 mb-8">Join BidWave and start bidding today</p>

                {}
                <a
                    href="http://localhost:5000/api/auth/google"
                    className="flex items-center justify-center gap-3 w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg py-3 px-4 text-white font-medium transition-colors mb-6"
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Continue with Google
                </a>

                {}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-800" />
                    <span className="text-gray-500 text-sm">or sign up with email</span>
                    <div className="flex-1 h-px bg-gray-800" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Your name" required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="you@example.com" required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="••••••••" required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">I want to</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors">
                            <option value="buyer">Buy items</option>
                            <option value="seller">Sell items</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 rounded-lg font-medium transition-colors">
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300">Log in</Link>
                </p>
            </motion.div>
        </div>
    )
}

export default RegisterPage