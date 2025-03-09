const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;

async function connectToDatabase() {
  if (client) {
    return client;
  }

  const uri = process.env.MONGO_URI;
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  try {
    const client = await connectToDatabase();
    const db = client.db('studyhub');
    
    if (req.url.startsWith("/api/fetch/resources")) {
      const collection = db.collection('directoryList');
      const resources = await collection.find().toArray();

      if (resources.length > 0) {
        return res.status(200).json(resources);
      } else {
        return res.status(404).json({ message: 'No resources found' });
      }
    }

    if (req.url.startsWith("/api/fetch/fun-facts")) {
      const collection = db.collection('fun-facts');
      const randomFactCursor = collection.aggregate([{ $sample: { size: 1 } }]);
      const randomFact = await randomFactCursor.toArray();

      if (randomFact.length === 0) {
        return res.status(200).json({ fact: null });
      }

      return res.status(200).json({ fact: randomFact[0] });
    }

    // If the URL doesn't match either route
    return res.status(404).json({ error: "Not Found" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
  }
}
