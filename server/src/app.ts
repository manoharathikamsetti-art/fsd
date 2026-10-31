import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { isDbConnected, getDbState } from './config/db';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import placementRoutes from './routes/placementRoutes';
import jobRoutes from './routes/jobRoutes';

const app: Application = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS blocked origin: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req: Request, _res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const dbConnected = isDbConnected();
  const dbState = getDbState();

  res.status(200).json({
    status: 'ok',
    message: 'Placement Management System API is operating.',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbConnected,
      state: dbState,
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/jobs', jobRoutes);

export default app;
