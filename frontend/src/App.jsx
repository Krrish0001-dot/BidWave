import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react' 
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from './store/authSlice'
import api from './utils/axios'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuctionDetailPage from './pages/AuctionDetailPage'
import LoginPage from  './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CreateAuctionPage from './pages/CreateAuctionPage'
import ProtectedRoute from './components/ProtectedRoute'
import OAuthCallbackPage from './pages/OAuthCallbackPage'

function App(){
  const dispatch = useDispatch()
  const { accessToken } = useSelector((state) => state.auth)

  useEffect(() => {
    if(accessToken) {
      api.get('/auth/me')
        .then((res) => dispatch(setUser(res.data.user)))
        .catch(() => {})
    }
  }, [accessToken,dispatch])

  return(
    <div className = "min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auctions/:id" element={<AuctionDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/create-auction" element={
          <ProtectedRoute>
            <CreateAuctionPage />
          </ProtectedRoute>
        } />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
      </Routes>
    </div>
  )
}

export default App