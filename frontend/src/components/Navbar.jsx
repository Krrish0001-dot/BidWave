import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import api from '../utils/axios'
import toast from 'react-hot-toast'

function Navbar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isAuthenticated, user } = useSelector((state) => state.auth)

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (error) {}
        dispatch(logout())
        navigate('/login')
        toast.success('Logged out successfully')
    }

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-white">
                    Bid<span className="text-purple-500">Wave</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                        Auctions
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <Link to="/create-auction" className="text-gray-400 hover:text-white transition-colors">
                                Sell
                            </Link>
                            <span className="text-gray-400 text-sm">Hi, {user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar