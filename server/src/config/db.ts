import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_management';

  try {
    mongoose.set('strictQuery', false);

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully to:', mongoose.connection.host);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected.');
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    return true;
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(`   Error: ${error.message}`);
    console.error('   Please verify MONGODB_URI in server/.env (e.g. MongoDB Atlas connection string or local MongoDB instance).');
    return false;
  }
};

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const getDbState = (): string => {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
};
