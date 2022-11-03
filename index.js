const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
require("dotenv").config();
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//const port = process.env.PORT || 8000;
const port = 8000;

// Password: Uf25rZozfSY9AvhU
// user: morahman

console.log(process.env.DB_USER, process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@hero-one.z3ku6ig.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const userCollection = client.db("simpleNode").collection("user");

    //Get Data
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    //Get Specific data
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = userCollection.find({ _id: ObjectId(id) });
      const users = await cursor.toArray();
      res.send(users);
    });

    // Post Data
    app.post("/users", async (req, res) => {
      const userData = req.body;
      const result = await userCollection.insertOne(userData);
      userData.id = result.id;
      console.log(result);
      res.send(userData);
    });

    // Update Data
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const userData = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: userData.name,
          email: userData.email,
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Delete Data
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      if (result.deletedCount > 0) {
        res.send({ status: 1, message: "Successfully deleted" });
      } else {
        res.send({
          status: 0,
          message: "No documents matched the query. Deleted 0 documents.",
        });
      }
    });
  } finally {
    //await client.close();
  }
}

run().catch((err) => console.log(error));

app
  .route("/service")
  .get((req, res) => {
    res.send("Get a random book");
  })
  .post((req, res) => {
    res.send("Add a book");
  })
  .put((req, res) => {
    res.send("Update the book");
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
