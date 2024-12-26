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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
      const filter = { userEmail: email };
      const bookings = await bookingCollection.find(filter).toArray();
      res.json(bookings);
    });

    app.post("/bookings", async (req, res) => {
      try {
        const newBooking = req.body;
        const result = await bookingCollection.insertOne(newBooking);

        // Step 2: Increment the booking count in the cars collection
        const id = newBooking.carId;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $inc: { bookingCount: 1 },
        };
        const updateResult = await carsCollection.updateOne(filter, updateDoc);

        res.status(201).json({
          message: "Booking successful!",
          bookingResult: result,
          updateResult,
        });
      } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ error: "Failed to create booking." });
      }
    });

    // Update booking date
    app.patch("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      const { bookingDate } = req.body;

      if (!ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid booking ID" });
      }

      if (!bookingDate) {
        return res
          .status(400)
          .json({ success: false, message: "Booking date is required" });
      }

      try {
        const updatedBooking = await bookingCollection.updateOne(
          id,
          { bookingDate: new Date(bookingDate) },
          { new: true } // Return the updated document
        );

        if (!updatedBooking) {
          return res
            .status(404)
            .json({ success: false, message: "Booking not found" });
        }

        res.status(200).json({
          success: true,
          message: "Booking date updated successfully",
          booking: updatedBooking,
        });
      } catch (error) {
        console.error("Error updating booking:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
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
