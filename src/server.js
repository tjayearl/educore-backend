import 'dotenv/config';
import app from './app.js';
import connectMongoDB from './config/mongodb.js';
import { initPostgresDB } from './config/initDB.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Initialize PostgreSQL tables
    await initPostgresDB();

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API: http://localhost:${PORT}`);
      console.log(`✓ Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();