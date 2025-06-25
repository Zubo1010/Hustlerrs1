const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hustlerrs',
      options
    );

    // Log successful connection
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("\nTo fix this issue:");
    console.log("1. Install MongoDB Community Server from: https://www.mongodb.com/try/download/community");
    console.log("2. After installation, open PowerShell as Administrator and run:");
    console.log("   mkdir -p \"C:\\data\\db\"");
    console.log("   net start MongoDB");
    console.log("\nIf MongoDB is already installed, just run:");
    console.log("   net start MongoDB");
    console.log("\nIf the issue persists:");
    console.log("1. Check if MongoDB service is running: Get-Service MongoDB");
    console.log("2. Check MongoDB logs: Get-EventLog -LogName Application -Source MongoDB");
    console.log("3. Try restarting MongoDB: net stop MongoDB && net start MongoDB");
    process.exit(1);
  }
};

module.exports = connectDB;
