const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicfix';
  
  try {
    // Set connection timeout short so we can fall back quickly if local MongoDB isn't running
    await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[Database] Connected to MongoDB: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (err) {
    console.warn(`[Database] Local MongoDB unreachable at ${connUri}. Falling back to embedded MongoDB Memory Server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to MongoDB Memory Server at ${memUri}`);
      return mongoose.connection;
    } catch (memErr) {
      console.error('[Database] Failed to start MongoDB Memory Server:', memErr);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
