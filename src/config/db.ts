import  mongoose from "mongoose";

const DB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGODB_URI??"");
    console.log("✅ Database connected: " + conn.connection.host);
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { DB };
