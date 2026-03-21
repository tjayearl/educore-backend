import app from './app.js';
import { initPostgresDB } from './config/initDB.js';
import { connectMongoDB } from './config/mongodb.js';

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Required for Render

// Initialize databases then start server
const startServer = async () => {
  try {
    // Initialize PostgreSQL
    await initPostgresDB();
    
    // Connect to MongoDB
    await connectMongoDB();

    // Start Express server - MUST bind to 0.0.0.0 for Render
    app.listen(PORT, HOST, () => {
      console.log(`✅ Server running on ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();