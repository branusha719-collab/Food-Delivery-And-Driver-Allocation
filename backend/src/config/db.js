const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using Mongoose
 * @param {string} [uri] - Optional MongoDB URI (defaults to process.env.MONGODB_URI)
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (uri) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/food_delivery';

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }
};

/**
 * Disconnects from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed');
  } catch (error) {
    console.error(`[MongoDB] Error closing connection: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
