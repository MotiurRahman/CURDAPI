const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
require("dotenv").config();
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//const port = process.env.PORT || 8000;
const port = 8000;

var jwt = require("jsonwebtoken");

console.log(process.env.DB_USER, process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@hero-one.z3ku6ig.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorization access" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "unauthorization access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const userCollection = client.db("simpleNode").collection("user");
    const serviceCollection = client.db("geniusCar").collection("services");
    const ordersCollection = client.db("geniusCar").collection("orders");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      var token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

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
        res.send({ status: 1, message: "Successfully deleted" });
      } else {
        res.send({
          status: 0,
          message: "No documents matched the query. Deleted 0 documents.",
        });
      }
    });

    app
      .route("/service")
      .get(async (req, res) => {
        const search = req.query.search;

        let query = {};

        if (search.length != 0) {
          query = {
            $text: {
              $search: search,
            },
          };
        }

        const order = req.query.order === "asc" ? 1 : -1;
        const cursor = await serviceCollection
          .find(query)
          .sort({ price: order });
        const users = await cursor.toArray();
        res.send(users);
      })
      .post((req, res) => {
        res.send("Add a book");
      })
      .put((req, res) => {
        res.send("Update the book");
      });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = serviceCollection.find({ _id: ObjectId(id) });
      const users = await cursor.toArray();
      res.send(users[0]);
    });

    //Orders API
    app.post("/orders", async (req, res) => {
      const ordersData = req.body;
      const result = await ordersCollection.insertOne(ordersData);
      res.send(result);
    });

    //Quiry API
    app.get("/orders", verifyJWT, async (req, res) => {
      const decode = req.decoded;
      console.log("inside order API", decode);
      if (decode.email != req.query.email) {
        return res.status(401).send({ message: "unauthorization access" });
      }

      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = await ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    //patch API
    app.patch("/orders/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const status = req.body.status;
      const updateDoc = {
        $set: {
          status: status,
        },
      };
      const result = await ordersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //Delete API
    app.delete("/orders/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    //await client.close();
  }
}

run().catch((err) => console.log(error));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
