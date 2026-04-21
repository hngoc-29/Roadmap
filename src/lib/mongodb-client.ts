// ============================================================
// LIB/MONGODB-CLIENT.TS - MongoClient dùng cho NextAuth Adapter
// ============================================================
// NextAuth adapter cần MongoClient (không phải Mongoose)
// Tách riêng để không conflict với Mongoose connection

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const options = {};

let clientPromise: Promise<MongoClient>;

if (!uri) {
  // Build-time: return a dummy promise that will never actually connect
  clientPromise = Promise.resolve(null as unknown as MongoClient);
} else if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
