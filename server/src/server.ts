import path from 'path';
import dotenv from 'dotenv';

// Support running from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { Request, Response } from 'express';

const PORT = process.env.PORT || 5000;

// Catch 404 routes in Express 5
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling middleware (must be registered after routes)
app.use(errorHandler);

const startServer = async () => {
  console.log('🚀 Initializing Placement Management System Server...');

  // Attempt to connect to database
  const connected = await connectDB();
  if (connected) {
    console.log('📦 Database connection established.');
  } else {
    console.warn('⚠️ Server starting in partial mode (Database is currently not connected).');
  }

  const server = app.listen(PORT, () => {
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🩺 Health check available at http://localhost:${PORT}/api/health`);
  });

  // Handle graceful shutdown
  const gracefulShutdown = () => {
    console.log('🛑 Shutting down server gracefully...');
    server.close(() => {
      console.log('👋 Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
};

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
