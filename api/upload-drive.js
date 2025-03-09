const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function uploadJSONToMongoDB() {
  try {
    const jsonFilePath = path.resolve(__dirname, '../public/scripts/directoryLinks.json');
    const rawData = fs.readFileSync(jsonFilePath, 'utf8');
    const directoryData = JSON.parse(rawData);
    const dataArray = Array.isArray(directoryData) ? directoryData : [directoryData];

    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MongoDB URI is missing! Please check your .env file.');
    }

    const client = new MongoClient(MONGO_URI, { connectTimeoutMS: 10000 });
    await client.connect();

    const db = client.db('studyhub');
    const collection = db.collection('directoryList');

    // Clear existing data before inserting new data
    await collection.deleteMany({});

    // Insert new data
    await collection.insertMany(dataArray);

    await client.close();
  } catch (error) {
    console.error('Error uploading JSON to MongoDB:', error.message);
  }
}

// Run the upload function
(async () => {
  await uploadJSONToMongoDB();
})();