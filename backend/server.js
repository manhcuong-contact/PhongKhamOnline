import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import clinicRoutes from './routes/clinic.js';
import doctorRoutes from './routes/doctor.js';
import appointmentRoutes from './routes/appointment.js';
import { initSockets } from './sockets/lockSocket.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import { startReminderJob } from './jobs/reminderJob.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const port = process.env.PORT || 5000;

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
    },
  },
}));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Allow more in dev
  message: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' },
});
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Basic route
app.get('/api', (req, res) => {
  res.send('API is running...');
});

// Socket.io
initSockets(io);

// Cron Jobs
startReminderJob();

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const frontendPath = path.join(__dirname, '../frontend/out');
  
  // Serve static assets (js, css, images, txt files)
  app.use(express.static(frontendPath, { index: false, redirect: false }));
  
  // Handle Next.js routing
  app.get(/^(?!\/api).*/, (req, res) => {
    let cleanPath = req.path;
    if (cleanPath.endsWith('/') && cleanPath.length > 1) {
      cleanPath = cleanPath.slice(0, -1);
    }

    if (cleanPath === '/') {
      return res.sendFile(path.join(frontendPath, 'index.html'));
    }

    const htmlPath = path.join(frontendPath, `${cleanPath}.html`);
    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }

    res.sendFile(path.join(frontendPath, '404.html'));
  });
}

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});
