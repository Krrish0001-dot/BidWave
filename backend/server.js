require("dotenv").config();
const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const auctionRoutes = require("./src/routes/auctionRoutes");
const bidRoutes = require('./src/routes/bidRoutes');
const startAuctionScheduler = require('./src/utils/auctionScheduler');
const redis = require('./src/config/redis');
const autoBidRoutes = require('./src/routes/autoBidRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const passport = require('./src/config/passport');
const { getMyBids } = require('./src/controllers/bidController');
const { protect } = require('./src/middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(passport.initialize());

const auctionViewers = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinAuction', (auctionId) => {
        socket.join(auctionId);
        if (!auctionViewers[auctionId]) {
            auctionViewers[auctionId] = new Set();
        }
        auctionViewers[auctionId].add(socket.id);
        io.to(auctionId).emit('viewerCount', {
            auctionId,
            count: auctionViewers[auctionId].size,
        });
        console.log(`User ${socket.id} joined auction ${auctionId} - ${auctionViewers[auctionId].size} watching`);
    });

    socket.on('leaveAuction', (auctionId) => {
        socket.leave(auctionId);
        if (auctionViewers[auctionId]) {
            auctionViewers[auctionId].delete(socket.id);
            io.to(auctionId).emit('viewerCount', {
                auctionId,
                count: auctionViewers[auctionId].size,
            });
        }
        console.log(`User ${socket.id} left auction ${auctionId}`);
    });

    socket.on('disconnect', () => {
        for (const auctionId in auctionViewers) {
            if (auctionViewers[auctionId].has(socket.id)) {
                auctionViewers[auctionId].delete(socket.id);
                io.to(auctionId).emit('viewerCount', {
                    auctionId,
                    count: auctionViewers[auctionId].size,
                });
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

app.set('io', io);

const startServer = async () => {
    await connectDB();
    startAuctionScheduler();

    app.use(generalLimiter);

    app.get('/api/bids/my-bids', protect, getMyBids);

    app.use("/api/auth", authRoutes);
    app.use("/api/auctions", auctionRoutes);
    app.use('/api/auctions/:id/bids', bidRoutes);
    app.use('/api/auctions/:id/autobids', autoBidRoutes);
    app.use('/api/auctions/:id/payments', paymentRoutes);

    app.get("/health", (req, res) => {
        res.json({ status: "Server is running" });
    });

    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();