import { MongoClient } from 'mongodb';

let client;

async function connectToDatabase() {
  if (client) {
    return client;
  }

  const uri = process.env.MONGO_URI;  // MongoDB URI from Vercel environment variables
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = client.db('studyhub');
    const collection = db.collection('notices');

    // Retrieve the 10 most recent notices (adjust sort order and limit)
    const notices = await collection.find().sort({ createdAt: -1 }).limit(10).toArray();

    if (notices.length > 0) {
      res.status(200).json(notices);
    } else {
      res.status(404).json({ message: 'No notices found' });
    }
  } catch (error) {
    console.error('Error fetching from MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
  }
}
