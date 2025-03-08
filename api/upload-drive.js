const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config(); // Load environment variables

async function uploadJSONToMongoDB() {
  try {
    console.log('🚀 Starting JSON upload process...');

    // Ensure JSON file is in the correct directory
    const jsonFilePath = path.resolve(__dirname, '../public/scripts/directoryLinks.json');
    console.log(`Looking for JSON file at: ${jsonFilePath}`);
    
    // Read JSON file
    const rawData = fs.readFileSync(jsonFilePath, "utf8");
    const directoryData = JSON.parse(rawData);
    const dataArray = Array.isArray(directoryData) ? directoryData : [directoryData];

    console.log(`📂 Read ${dataArray.length} records from JSON file.`);

    const MONGO_URI = process.env.MONGO_URI;
    const DATABASE_NAME = "studyhub";
    const COLLECTION_NAME = "directoryList";

    // Ensure MongoDB URI is set
    if (!MONGO_URI) {
      throw new Error('MongoDB URI is missing! Check your .env file.');
    }

    console.log('🔗 Connecting to MongoDB Atlas...');
    const client = new MongoClient(MONGO_URI, { connectTimeoutMS: 10000 });
    await client.connect();
    console.log('✅ Connected to MongoDB.');

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Clear existing data before inserting new data
    await collection.deleteMany({});
    console.log('🗑️ Cleared existing records from MongoDB.');

    // Insert new data
    await collection.insertMany(dataArray);
    console.log('✅ JSON file uploaded successfully to MongoDB.');

    await client.close();
    console.log('🔌 MongoDB connection closed.');
  } catch (error) {
    console.error('❌ Error uploading JSON:', error.message);
  }
}

// Run the upload function
(async () => {
  console.log('📤 Calling uploadJSONToMongoDB function...');
  await uploadJSONToMongoDB();
})();
