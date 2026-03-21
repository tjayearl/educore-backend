import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 
      'mongodb+srv://iamtjayearl_db_user:oyPFFXASydaMW17i@cluster0.sixjnmk.mongodb.net/educore_content?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});