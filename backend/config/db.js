import mongoose from 'mongoose';

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (uri && uri.includes('cluster0.mongodb.net')) {
      console.log('MongoDB URI is placeholder. Falling back to mongodb-memory-server for local testing...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected (Memory): ${conn.connection.host}`);
      
      console.log('Seeding memory database...');
      const { importData } = await import('../seed.js');
      await importData(false); // Do not exit process after seeding
      return;
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
