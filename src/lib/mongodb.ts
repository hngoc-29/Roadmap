// ============================================================
// LIB/MONGODB.TS - Singleton MongoDB connection với Mongoose
// ============================================================

import mongoose from "mongoose";

// ✅ Không throw ở module level — chỉ báo lỗi khi connectDB() thực sự được gọi
//    Điều này cho phép Next.js build static pages mà không cần MONGODB_URI

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  // Lỗi chỉ được ném khi hàm này thực sự được gọi (runtime, không phải build)
  if (!uri) {
    throw new Error(
      "❌ Thiếu MONGODB_URI trong biến môi trường. Xem file .env.example"
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        console.log("✅ MongoDB connected");
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
