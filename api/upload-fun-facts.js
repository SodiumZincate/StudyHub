const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function uploadFunFactsToMongoDB() {
  try {
    // Path to the fun-facts.json file
    const jsonFilePath = path.resolve(__dirname, '../public/scripts/fun-facts.json');
    const rawData = fs.readFileSync(jsonFilePath, 'utf8');
    const funFactsData = JSON.parse(rawData);

    // MongoDB URI from environment variables
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MongoDB URI is missing! Please check your .env file.');
    }

    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI, { connectTimeoutMS: 10000 });
    await client.connect();

    const db = client.db('studyhub');
    const collection = db.collection('fun-facts');

    // Clear existing data before inserting new data (optional, depending on your use case)
    await collection.deleteMany({});

    // Insert fun facts into MongoDB one by one
    for (const fact of funFactsData) {
      await collection.insertOne(fact);
    }

    // Close MongoDB connection
    await client.close();

    console.log(`Fun facts uploaded successfully.`);
  } catch (error) {
    console.error('Error uploading fun facts JSON:', error.message);
  }
}

// Run the upload function
(async () => {
  await uploadFunFactsToMongoDB();
})();
