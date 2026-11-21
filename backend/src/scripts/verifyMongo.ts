import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { logger } from '../utils/logger';

async function checkMongo() {
  const uri = process.env.MONGODB_URI;

  console.log('============================================================');
  console.log('   GROWPLUS MONGODB CONNECTIVITY VERIFICATION');
  console.log('============================================================\n');

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  // Sanitize URI for safe display (never show credentials)
  const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:********@');
  console.log(`ℹ️ Target URI: ${sanitizedUri}`);

  try {
    const startTime = Date.now();
    console.log('🔄 Attempting connection to MongoDB cluster...');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    const elapsed = Date.now() - startTime;
    console.log(`✅ Connection established successfully in ${elapsed}ms!`);

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database handle not available after connection');
    }

    console.log(`📦 Active Database: ${db.databaseName}`);

    // Ping admin
    console.log('🔄 Pinging MongoDB deployment...');
    const pingResult = await db.admin().ping();
    console.log('✅ Admin Ping Result:', pingResult);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📂 Collections in database (${collections.length}):`);
    if (collections.length === 0) {
      console.log('   (No collections found yet — will be created automatically on first event log)');
    } else {
      collections.forEach(c => console.log(`   - ${c.name}`));
    }

    // Test write & read to verify write permissions
    console.log('🔄 Verifying write permissions with test document...');
    const testCollection = db.collection('_growplus_connectivity_test');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      system: 'GrowPlus Backend Test',
    };
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`✅ Test document written (ID: ${insertResult.insertedId})`);

    // Clean up
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Test document cleaned up successfully.');

    console.log('\n============================================================');
    console.log('🎉 RESULT: MongoDB connection and read/write verified 100%!');
    console.log('============================================================\n');

  } catch (err: any) {
    console.error('\n❌ MongoDB Connection Error:', err.message);
    if (err.name === 'MongooseServerSelectionError') {
      console.error('💡 Tip: Check your network/IP whitelist in MongoDB Atlas. Ensure "0.0.0.0/0" (or your current IP) is added to Network Access.');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Disconnected cleanly.');
  }
}

checkMongo();
