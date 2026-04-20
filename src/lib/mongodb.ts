// ============================================================
// LIB/MONGODB.TS - Singleton MongoDB connection với Mongoose
// ============================================================
// Pattern: Dùng global cache để tránh tạo nhiều connection
// trong Next.js dev mode (hot reload tạo ra module mới mỗi lần)

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "❌ Thiếu MONGODB_URI trong biến môi trường. Xem file .env.example"
  );
}

// Khai báo kiểu cho global cache (tránh TypeScript lỗi)
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Khởi tạo cache nếu chưa có
const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

/**
 * connectDB - Hàm kết nối MongoDB với Singleton Pattern
 *
 * ✅ Tái sử dụng connection đã có (tránh "too many connections")
 * ✅ An toàn trong môi trường Serverless (Vercel Edge/Node runtime)
 * ✅ Tự động retry nếu kết nối bị đứt
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Nếu đã có connection, trả về luôn (không tạo mới)
  if (cached.conn) {
    return cached.conn;
  }

  // Nếu chưa có promise đang chạy, tạo mới
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Không buffer khi chưa connected
      maxPoolSize: 10,       // Tối đa 10 connections trong pool
      serverSelectionTimeoutMS: 5000, // Timeout sau 5s
      socketTimeoutMS: 45000,         // Đóng socket sau 45s không hoạt động
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null; // Reset để có thể retry
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
