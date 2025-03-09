const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();

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

app.get('/api/fun-facts', async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db('studyhub');
    const collection = db.collection('fun-facts');

    const randomFactCursor = collection.aggregate([{ $sample: { size: 1 } }]);
    const randomFact = await randomFactCursor.toArray();

    if (randomFact.length === 0) {
      return res.status(200).json({ fact: null });
    }

    res.status(200).json({ fact: randomFact[0] });
  } catch (err) {
    console.error("Error fetching fun fact:", err);
    res.status(500).json({ error: 'Failed to fetch fun fact' });
  }
});

// This function is required by Vercel to handle requests
module.exports = app;