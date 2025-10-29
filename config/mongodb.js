import mongoose from "mongoose";

const dbUri = process.env.NODE_ENV === "production" 
    ? process.env.PROD_DB_URI 
    : process.env.DEV_DB_URI;

export const connectDB = async () => {


  try {
    const conn = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host} running ${process.env.NODE_ENV}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit on failure
  }
};