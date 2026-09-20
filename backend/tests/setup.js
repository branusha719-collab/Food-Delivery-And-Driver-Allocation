const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Initializes and connects to an in-memory MongoDB instance for hermetic tests
 */
const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

/**
 * Clears all documents in all collections between test suites
 */
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Closes mongoose connection and shuts down in-memory MongoDB
 */
const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = {
  connectTestDB,
  clearTestDB,
  disconnectTestDB
};
