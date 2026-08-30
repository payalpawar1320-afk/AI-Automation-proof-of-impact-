import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/proof_of_impact";

async function verifyMongo() {
  console.log("==================================================");
  console.log("   TESTING MONGODB ATLAS LIVE CONNECTION");
  console.log("==================================================");
  console.log("Connecting to:", uri.replace(/:[^:]*@/, ':****@'));

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("\n[SUCCESS] Successfully connected to MongoDB Atlas!");
    console.log("Database Name:", conn.connection.name);
    console.log("Cluster Host:", conn.connection.host);
    console.log("Connection State:", conn.connection.readyState === 1 ? '1 (CONNECTED)' : conn.connection.readyState);

    const collections = await conn.connection.db.listCollections().toArray();
    console.log("\nFound Collections (" + collections.length + "):");
    for (const c of collections) {
      const count = await conn.connection.db.collection(c.name).countDocuments();
      console.log(` - ${c.name}: ${count} documents`);
    }

    await mongoose.disconnect();
    console.log("\n[SUCCESS] All checks passed. Database is online and operational!");
  } catch (err) {
    console.error("\n[ERROR] Connection failed:", err.message);
  }
}

verifyMongo();
