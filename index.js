require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hathz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const carsCollection = client.db("carsDB").collection("cars");

    // All cars collection.
    app.post("/cars", async (req, res) => {
      const car = req.body;
      car.bookingStatus = "Available";
      car.dateAdded = new Date();

      const result = await carsCollection.insertOne(car);
      res.send(result);
    });

    app.get("/cars", async (req, res) => {
      const cars = await carsCollection.find().toArray();
      res.send(cars);
    });


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("CarPickUp server is running here");
});

app.listen(port, () => {
  console.log(`CarPickUp server is running on port: ${port}`);
});
