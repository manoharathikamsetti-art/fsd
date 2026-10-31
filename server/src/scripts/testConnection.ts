import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';

const testConnection = async () => {
  const uri = process.env.MONGODB_URI;
  console.log('🔍 Testing MongoDB Connection...');
  console.log(`   Configured URI format: ${uri ? uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT SET'}`);

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  try {
    const start = Date.now();
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const duration = Date.now() - start;

    console.log(`✅ MongoDB Connection Successful! (took ${duration}ms)`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port || 'default SRV'}`);
    console.log(`   Database Name: ${mongoose.connection.name}`);
    console.log(`   Ready State: ${mongoose.connection.readyState} (1 = Connected)`);

    await mongoose.disconnect();
    console.log('👋 Test connection closed cleanly.');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ MongoDB Connection Failed:');
    console.error(`   Message: ${err.message}`);
    if (err.name === 'MongoServerSelectionError') {
      console.error('   Diagnostics: Could not reach MongoDB cluster. Common reasons:');
      console.error('   1. IP address not whitelisted in MongoDB Atlas Network Access (needs 0.0.0.0/0 or current IP).');
      console.error('   2. Incorrect username or password in connection string.');
      console.error('   3. Local MongoDB service is stopped.');
    }
    process.exit(1);
  }
};

testConnection();
