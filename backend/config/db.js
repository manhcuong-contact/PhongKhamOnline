import mongoose from 'mongoose';

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!uri || uri.includes('cluster0.mongodb.net')) {
      console.log('MongoDB URI is missing or placeholder. Falling back to mongodb-memory-server for local testing...');
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
    console.error(`MongoDB Connection Error: ${error.message}`);
    // We don't exit the process here so that the frontend can still be served 
    // even if the database connection string is slightly misconfigured.
  }
};
