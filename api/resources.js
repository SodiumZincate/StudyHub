import { MongoClient } from 'mongodb';

let client;

async function connectToDatabase() {
  if (client) {
    return client;
  }

  const uri = process.env.MONGO_URI; // Ensure this is set in Vercel environment variables
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  try {
    const client = await connectToDatabase();
    const db = client.db('studyhub'); // Replace with your actual database name
    const collection = db.collection('directoryList'); // Replace with your collection name

    // Fetch all resources
    const resources = await collection.find().toArray();

    if (resources.length > 0) {
      res.status(200).json(resources);
    } else {
      res.status(404).json({ message: 'No resources found' });
    }
  } catch (error) {
    console.error('Error fetching from MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
  }
}
