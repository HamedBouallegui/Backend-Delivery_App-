const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variable or use default local connection
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/delivery_app';
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\n❌ MongoDB connection error:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('127.0.0.1')) {
      console.error('\n📋 To fix this issue:');
      console.error('1. Open Services (Win + R, type "services.msc")');
      console.error('2. Find "MongoDB Server (MongoDB)"');
      console.error('3. Right-click and select "Start"');
      console.error('\nOR run PowerShell as Administrator and execute:');
      console.error('   Start-Service -Name MongoDB');
      console.error('\nOR use MongoDB Compass to verify the connection');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('mongodb.net')) {
      console.error('\n📋 MongoDB Atlas connection issue:');
      console.error('1. Check your MONGODB_URI in .env file');
      console.error('2. Verify your internet connection');
      console.error('3. Ensure your IP is whitelisted in MongoDB Atlas');
    } else {
      console.error('\n📋 Please check:');
      console.error('1. MongoDB service is running');
      console.error('2. Connection string is correct');
      console.error('3. Network/firewall settings');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
