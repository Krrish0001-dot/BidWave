import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/axios'
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading } = useSelector((state) => state.auth)

    const handleSubmit = async (e) => {
        e.preventDefault()
        dispatch(loginStart())
        try {
            const res = await api.post('/auth/login', { email, password })
            dispatch(loginSuccess(res.data))
            toast.success('Welcome back!')
            navigate('/')
        } catch (error) {
            dispatch(loginFailure(error.response?.data?.message || 'Login failed'))
            toast.error(error.response?.data?.message || 'Login failed')
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
                <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
                <p className="text-gray-400 mb-8">Log in to place bids and track auctions</p>

                <a href="http://localhost:5000/api/auth/google" className="flex items-center justify-center gap-3 w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg py-3 px-4 text-white font-medium transition-colors mb-6">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Continue with Google
                </a>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-800" />
                    <span className="text-gray-500 text-sm">or sign in with email</span>
                    <div className="flex-1 h-px bg-gray-800" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-6">
                    No account?{' '}
                    <Link to="/register" className="text-purple-400 hover:text-purple-300">
                        Sign up free
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}

export default LoginPage