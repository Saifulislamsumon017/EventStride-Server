const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    // marathonsCollection
    const marathonsCollection = client
      .db('marathonsManagement')
      .collection('marathons');

    // registationcollection

    const registrationsCollection = client
      .db('marathonsManagement')
      .collection('registrations');

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
      const query = { _id: new ObjectId(id) };
      const result = await marathonsCollection.findOne(query);
      res.send(result);
    });

    // Registrations  All API

    app.get('/registration', async (req, res) => {
      const email = req.query.email;
      const query = {
        applicantEmail: email,
      };
      const result = await registrationsCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/registration', async (req, res) => {
      const registrationData = req.body;
      const result = await registrationsCollection.insertOne(registrationData);
      res.send(result);
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
