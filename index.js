const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//const port = process.env.PORT || 8000;
const port = 8000;

// Password: Uf25rZozfSY9AvhU
// user: morahman

const uri =
  "mongodb+srv://morahman:Uf25rZozfSY9AvhU@hero-one.z3ku6ig.mongodb.net/?retryWrites=true&w=majority";
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
        res.send({ status: 1, msg: "Delete Success" });
      } else {
        res.send({ status: 0, msg: "Delete Failed" });
      }
    });
  } finally {
    //await client.close();
  }
}

run().catch((err) => console.log(error));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
