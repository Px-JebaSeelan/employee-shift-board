require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const shiftRoutes = require('./routes/shiftRoutes');

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;

mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
})
    .then(() => {
        console.log('✓ MongoDB connected');
        app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('✗ MongoDB connection failed:', err.message);
        process.exit(1);
    });

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Server shutdown');
    process.exit(0);
});
