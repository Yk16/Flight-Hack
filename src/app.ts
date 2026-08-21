import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFoundHandler } from './shared/middleware';
import { authRoutes } from './modules/auth';
import { userRoutes, adminRoutes } from './modules/user';
import { housingRoutes } from './modules/housing';
import { bookingRoutes } from './modules/booking';
import { flatmateRoutes } from './modules/flatmate';
import { chatRoutes } from './modules/chat';
import { agreementRoutes } from './modules/agreement';
import { paymentRoutes } from './modules/payment';
import { serviceRoutes } from './modules/service';
import { setupSocket } from './socket';
import path from 'path';
import { uploadsRoutes } from './modules/uploads/uploads.routes';

// Initialize Express app
const app: Application = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests, please try again later',
        },
    },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (PDFs/Agreements)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'SettleMate API is running',
        timestamp: new Date().toISOString(),
        environment: config.env,
    });
});

// ============================================
// API ROUTES
// ============================================

const API_PREFIX = '/api/v1';

// Auth routes
app.use(`${API_PREFIX}/auth`, authRoutes);

// User routes
app.use(`${API_PREFIX}/users`, userRoutes);

// Admin routes
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Housing routes
app.use(`${API_PREFIX}/houses`, housingRoutes);

// Booking routes
app.use(`${API_PREFIX}/bookings`, bookingRoutes);

// Flatmate routes
app.use(`${API_PREFIX}/flatmates`, flatmateRoutes);

// Chat routes
app.use(`${API_PREFIX}/chat`, chatRoutes);

// Agreement routes
app.use(`${API_PREFIX}/agreements`, agreementRoutes);

// Payment routes
app.use(`${API_PREFIX}/payments`, paymentRoutes);

// Post Move-in Services routes
app.use(`${API_PREFIX}/services`, serviceRoutes);

// Uploads (images, files)
app.use(`${API_PREFIX}/uploads`, uploadsRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const startServer = async () => {
    try {
        const port = config.port;

        const server = app.listen(port, () => {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏠 SettleMate Backend API                                ║
║                                                            ║
║   Server running on port ${port}                             ║
║   Environment: ${config.env.padEnd(40)}║
║                                                            ║
║   Health check: http://localhost:${port}/health              ║
║   API Base URL: http://localhost:${port}${API_PREFIX}              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
        });

        // Initialize Socket.io
        setupSocket(server);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
