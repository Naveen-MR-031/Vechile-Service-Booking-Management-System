const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// --- Socket.io ---
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// --- Middleware ---
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.CLIENT_URL || 'http://localhost:5173',
            'http://localhost:5173',
            'http://localhost:5174'
        ].filter(Boolean);
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins in dev; restrict in production if needed
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io accessible in routes
app.set('io', io);

// --- Database Connection ---
let isDbConnected = false;
const connectDB = async (retries = 3) => {
    if (isDbConnected) return;
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        console.error('❌ MONGODB_URI is not set');
        throw new Error('MONGODB_URI is not set');
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🔄 Connecting to MongoDB... (attempt ${attempt}/${retries})`);
            await mongoose.connect(mongoURI, {
                serverSelectionTimeoutMS: 15000,
                socketTimeoutMS: 45000,
                family: 4, // Force IPv4
            });
            console.log('✅ MongoDB Connected Successfully');
            isDbConnected = true;
            return;
        } catch (err) {
            console.error(`❌ Attempt ${attempt} failed:`, err.message);
            if (attempt < retries) {
                const wait = Math.pow(2, attempt) * 1000;
                console.log(`⏳ Retrying in ${wait / 1000}s...`);
                await new Promise(r => setTimeout(r, wait));
            }
        }
    }
    console.error('❌ All MongoDB connection attempts failed.');
    throw new Error('MongoDB connection failed');
};

// --- Socket.io Events ---
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`👤 User ${userId} joined room`);
    });

    socket.on('joinBooking', (bookingId) => {
        socket.join(`booking:${bookingId}`);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// --- Health Check ---
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'VSBM System API',
        database: 'MongoDB Atlas',
        timestamp: new Date().toISOString()
    });
});

// --- SMTP Debug (temporary) ---
app.get('/debug-smtp', async (req, res) => {
    const dns = require('dns').promises;
    const net = require('net');
    const results = {};
    // 1) DNS resolve4
    try {
        const ips = await dns.resolve4('smtp.gmail.com');
        results.dns_resolve4 = ips;
    } catch (e) { results.dns_resolve4_error = e.message; }
    // 2) DNS lookup with family 4
    try {
        const { address } = await dns.lookup('smtp.gmail.com', { family: 4 });
        results.dns_lookup_v4 = address;
    } catch (e) { results.dns_lookup_v4_error = e.message; }
    // 3) TCP connect to resolved IP on port 587
    const ip = results.dns_resolve4?.[0] || results.dns_lookup_v4;
    if (ip) {
        try {
            await new Promise((resolve, reject) => {
                const sock = net.createConnection({ host: ip, port: 587 });
                const t = setTimeout(() => { sock.destroy(); reject(new Error('timeout 10s')); }, 10000);
                sock.once('connect', () => { clearTimeout(t); results.tcp_587 = `connected to ${sock.remoteAddress}:${sock.remotePort}`; sock.destroy(); resolve(); });
                sock.once('error', (err) => { clearTimeout(t); reject(err); });
            });
        } catch (e) { results.tcp_587_error = e.message; }
        // 4) TCP connect on port 465
        try {
            await new Promise((resolve, reject) => {
                const sock = net.createConnection({ host: ip, port: 465 });
                const t = setTimeout(() => { sock.destroy(); reject(new Error('timeout 10s')); }, 10000);
                sock.once('connect', () => { clearTimeout(t); results.tcp_465 = `connected to ${sock.remoteAddress}:${sock.remotePort}`; sock.destroy(); resolve(); });
                sock.once('error', (err) => { clearTimeout(t); reject(err); });
            });
        } catch (e) { results.tcp_465_error = e.message; }
    }
    // 5) Quick SMTP verify
    try {
        const nodemailer = require('nodemailer');
        const t = nodemailer.createTransport({
            host: ip || 'smtp.gmail.com', port: 587, secure: false,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
            tls: { servername: 'smtp.gmail.com' },
            connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 10000,
        });
        await t.verify();
        results.smtp_verify = 'OK';
        t.close();
    } catch (e) { results.smtp_verify_error = `${e.code || ''} ${e.message}`; }
    res.json(results);
});

// --- API Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/service-provider', require('./routes/serviceProviderRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));

// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// --- Error Handler ---
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            message: `Duplicate value for ${field}`
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 5001;

const startServer = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}`);
        console.log(`🌐 Frontend: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
};
startServer();

module.exports = app;
