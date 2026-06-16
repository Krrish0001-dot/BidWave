import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/axios'
import { loginSuccess } from '../store/authSlice'

function OAuthCallbackPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        let cancelled = false

        const token = searchParams.get('token')

        if (!token) {
            toast.error('Google sign-in failed. Please try again.')
            navigate('/login')
            return
        }

        const completeLogin = async () => {
            try {
                localStorage.setItem('accessToken', token)

                const res = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (cancelled) return

                const user = res.data.user || res.data.data || res.data

                dispatch(loginSuccess({ user, accessToken: token }))
                toast.success(`Welcome, ${user.name}!`)
                navigate('/')
            } catch (err) {
                if (cancelled) return
                toast.error('Could not complete sign-in. Please try again.')
                localStorage.removeItem('accessToken')
                navigate('/login')
            }
        }

        completeLogin()

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Signing you in with Google...</p>
            </motion.div>
        </div>
    )
}

export default OAuthCallbackPage