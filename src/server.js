require('dotenv').config();
const app = require('./app');
const connectMongoDB = require('./config/mongodb');
const initPostgresDB = require('./config/initDB');

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