const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || undefined,
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;