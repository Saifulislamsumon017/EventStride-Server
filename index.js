const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ========== VerifyToken ==========

// const verifyToken = (req, res, next) => {
//   const token = req?.cookies?.token;

//   if (!token) return res.status(401).json({ message: 'Unauthorized' });

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ message: 'Forbidden' });
//     req.user = decoded;
//     next();
//   });
// };

// MongoDB URI
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
    // await client.connect();

    const marathonsCollection = client
      .db('marathonsManagement')
      .collection('marathons');

    const organizersCollection = client
      .db('marathonsManagement')
      .collection('organizers');

    const registrationsCollection = client
      .db('marathonsManagement')
      .collection('registrations');

    // ========== JWT Token APIs ==========

    // app.post('/jwt', async (req, res) => {
    //   const userInfo = req.body;

    //   const token = jwt.sign(userInfo, process.env.JWT_SECRET, {
    //     expiresIn: '7d',
    //   });

    //   res.cookie('token', token, {
    //     httpOnly: true,
    //     secure: false,
    //   });

    //   res.send({ success: true });
    // });

    // ========== Marathon APIs ==========
    // GET /marathons?sort=desc&limit=8&upcoming=true/false
    app.get('/marathons', async (req, res) => {
      try {
        const sortOrder = req.query.sort === 'asc' ? 1 : -1;
        const limit = parseInt(req.query.limit) || 100;
        const upcomingFilter = req.query.upcoming;

        const filter = {};
        if (upcomingFilter === 'true') filter.upcoming = true;
        if (upcomingFilter === 'false') filter.upcoming = false;

        const marathons = await marathonsCollection
          .find(filter)
          .sort({ marathonStartDate: sortOrder })
          .limit(limit)
          .toArray();

        res.json(marathons);
      } catch (err) {
        console.error('Error fetching marathons:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    // app.get('/marathons', async (req, res) => {
    //   const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    //   const limit = parseInt(req.query.limit) || 100;
    //   const email = req.query.email;

    //   const filter = {};
    //   if (email) {
    //     filter.userEmail = email;
    //   }

    //   const marathons = await marathonsCollection
    //     .find(filter)
    //     .sort({ createdAt: sortOrder })
    //     .limit(limit)
    //     .toArray();

    //   res.send(marathons);
    // });

    app.get('/marathons/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await marathonsCollection.findOne(query);
      res.send(result);
    });

    app.post('/marathons', async (req, res) => {
      const addMarathon = req.body;
      const result = await marathonsCollection.insertOne(addMarathon);
      res.send(result);
    });

    app.put('/marathons/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await marathonsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });

    app.delete('/marathons/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await marathonsCollection.deleteOne(query);
      res.send(result);
    });

    // Upcoming Marathons (only events with upcoming=true)
    app.get('/upcoming-marathons', async (req, res) => {
      try {
        const today = new Date().toISOString().split('T')[0];

        const upcomingMarathons = await marathonsCollection
          .find({
            upcoming: true,
            marathonStartDate: { $gte: today },
          })
          .sort({ marathonStartDate: 1 })
          .limit(8)
          .toArray();

        res.json(upcomingMarathons);
      } catch (err) {
        console.error('Error fetching upcoming marathons:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    // Get top organizers

    app.get('/organizers', async (req, res) => {
      try {
        // Fetch all organizers, optionally limit to top 8
        const topOrganizers = await organizersCollection
          .find({})
          .sort({ totalMarathons: -1 }) // Sort by totalMarathons descending
          .limit(8)
          .toArray();

        console.log('Top organizers fetched:', topOrganizers); // Debug
        res.send(topOrganizers);
      } catch (error) {
        console.error('Error fetching organizers:', error);
        res.status(500).send({ error: 'Failed to fetch organizers' });
      }
    });

    // ========== Registration APIs ==========

    app.get('/registration', async (req, res) => {
      const email = req.query.email;
      const search = req.query.search || '';

      const query = {
        applicantEmail: email,
        marathonTitle: { $regex: search, $options: 'i' },
      };

      const result = await registrationsCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/registration', async (req, res) => {
      const data = req.body;

      const result = await registrationsCollection.insertOne(data);

      if (result.insertedId) {
        await marathonsCollection.updateOne(
          { _id: new ObjectId(data.marathonId) },
          { $inc: { totalRegistrationCount: 1 } }
        );
      }

      res.send(result);
    });

    app.put('/registration/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await registrationsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });

    app.delete('/registration/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await registrationsCollection.deleteOne(query);
      res.send(result);
    });

    // ========== NEW: Registration Count for a Marathon ==========

    app.get('/registrations/count', async (req, res) => {
      const marathonId = req.query.marathonId;

      if (!marathonId) {
        return res.status(400).json({ error: 'marathonId is required' });
      }

      try {
        const count = await registrationsCollection.countDocuments({
          marathonId: marathonId,
        });

        res.json({ count });
      } catch (error) {
        console.error('Error counting registrations:', error);
        res.status(500).json({ error: 'Failed to fetch count' });
      }
    });

    // Dashboard Overview with Aggregation
    app.get('/dashboard/overview', async (req, res) => {
      try {
        // Total marathons
        const totalMarathons = await marathonsCollection.countDocuments({});
        // Upcoming marathons
        const upcomingMarathons = await marathonsCollection.countDocuments({
          upcoming: true,
        });
        // Total companies
        const totalCompanies = await organizersCollection.countDocuments({});
        // Total registrations
        const totalRegistrations = await registrationsCollection.countDocuments(
          {}
        );

        // Aggregation: Get upcoming marathons with registration count
        const upcomingMarathonsList = await marathonsCollection
          .aggregate([
            { $match: { upcoming: true } },
            {
              $lookup: {
                from: 'registrations',
                localField: '_id',
                foreignField: 'marathonId',
                as: 'registrations',
              },
            },
            {
              $addFields: {
                registrationCount: { $size: '$registrations' },
              },
            },
            { $project: { registrations: 0 } },
            { $sort: { marathonStartDate: 1 } },
            { $limit: 6 },
          ])
          .toArray();

        res.json({
          totalMarathons,
          upcomingMarathons,
          totalCompanies,
          totalRegistrations,
          upcomingMarathonsList,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    // ========== MongoDB Ping Check ==========
    // await client.db('admin').command({ ping: 1 });
    console.log('✅ Connected to MongoDB successfully!');
  } finally {
    // Optional cleanup logic here if needed
  }
}
run().catch(console.dir);

// ========== Root Route ==========
app.get('/', (req, res) => {
  res.send('🎉 Welcome to EventStride Server!');
});

// ========== Start Server ==========
app.listen(port, () => {
  console.log(`✅ EventStride server is running on port ${port}`);
});
