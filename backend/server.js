require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

let server;
let currentPort = parseInt(process.env.PORT || '5000', 10);

const startServer = async (portToTry) => {
  try {
    // Connect to MongoDB
    await connectDB();

    server = http.createServer(app);

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${portToTry} is already in use (common on macOS due to AirPlay Receiver).`);
        const nextPort = portToTry + 1;
        console.log(`🔄 Attempting to start on port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error(`❌ Server error: ${err.message}`);
        process.exit(1);
      }
    });

    server.listen(portToTry, () => {
      console.log(`==================================================`);
      console.log(`🚀 Food Delivery Core Backend running on port ${portToTry}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${portToTry}/api/health`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n[${signal}] Received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer(currentPort);
