const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.skjlfzl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const marathonsCollection = client
      .db('marathonsManagement')
      .collection('marathons');

    // Marathons Api

    app.get('/marathons', async (req, res) => {
      const sortOrder = req.query.sort === 'asc' ? 1 : -1;
      const limit = parseInt(req.query.limit) || 100;

      const marathons = await marathonsCollection
        .find()
        .sort({ createdAt: sortOrder })
        .limit(limit)
        .toArray();

      res.send(marathons);
    });

    app.get('/marathons/:id', async (req, res) => {
      const id = req.params.id;
      const marathon = await marathonsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(marathon);
    });

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send(
    '🎉 Welcome to EventStride Server! Your Marathon Management System is up and running.'
  );
});

app.listen(port, () => {
  console.log(`✅ EventStride server is running on port ${port}`);
});
