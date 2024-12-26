require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
      "Pinged your deployment h. You successfully connected to MongoDB!"
    );

    const carsCollection = client.db("carsDB").collection("cars");
    const bookingCollection = client.db("carsDB").collection("bookings");

    // All cars collection.

    app.get("/cars", async (req, res) => {
      const cars = await carsCollection.find().toArray();
      res.send(cars);
    });

    app.post("/cars", async (req, res) => {
      const car = req.body;
      car.bookingStatus = "Available";
      car.dateAdded = new Date();

      const result = await carsCollection.insertOne(car);
      res.send(result);
    });

    // API to fetch recent cars
    app.get("/cars/recent", async (req, res) => {
      try {
        const recentCars = await carsCollection
          .find()
          .sort({ dateAdded: -1 })
          .limit(8)
          .toArray();
        res.send(recentCars);
      } catch (error) {
        console.error("Error fetching recent cars:", error);
        res.status(500).send({ message: "Failed to fetch recent cars" });
      }
    });

    // api for car details page.
    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });


    app.get("/myCars/:email", async (req, res) => {
      const email = req.params.email;
      const cars = await carsCollection.find({ userEmail: email }).toArray();
      res.send(cars);
    });

    // -----------------------------------------------------------------------------------------

    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const filter = {userEmail: email}
      const bookings = await bookingCollection.find(filter).toArray();
      res.json(bookings);
    });

    app.post("/bookings", async (req, res) => {
      const newBooking = req.body;
      const result = await bookingCollection.insertOne(newBooking);
      // ---test
      const id = newBooking.carId;
      const query = { _id: new ObjectId(id) };
      const booking = await carsCollection.findOne(query)
      // console.log(booking);
      let newCount = 0;
      if (booking.bookingCount) {
        newCount = booking.bookingCount + 1;
      } else {
        newCount = 1;
      }
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          bookingCount: newCount,
        }
      }
      const updateResult = await carsCollection.updateOne(filter, updateDoc);
      // ---test
      res.json(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });
    // -----------------------------------------------------------------------------------------

    // PUT: Update a specific car
app.put("/cars/:id", async (req, res) => {
  const { id } = req.params;
  const { _id, ...updateData } = req.body;

  try {
    const result = await carsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount > 0) {
      res.json({ success: true, message: "Car updated successfully!" });
    } else {
      res.json({ success: false, message: "No changes were made!" });
    }
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Failed to update car details." });
  }
});


    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
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
