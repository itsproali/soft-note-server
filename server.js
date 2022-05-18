const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.jggf1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    client.connect();
    const taskCollection = client.db("SoftNote").collection("tasks");

    // add new task
    app.post("/add-task", async (req, res) => {
      const task = req.body.task;
      const userId = req.body.userId;
      const addTask = await taskCollection.insertOne(task);
      const tasks = await taskCollection.find({ userId }).toArray();
      res.send(tasks);
    });

    //   get All task
    app.get("/tasks/:userId", async (req, res) => {
      const userId = req.params.userId;
      const query = { userId };
      const tasks = await taskCollection.find(query).toArray();
      res.send(tasks);
    });

    app.put("/complete/:taskId", async (req, res) => {
      const getId = req.params.taskId;
      const taskId = { _id: ObjectId(getId) };
      const complete = req.body.complete;
      const options = { upsert: true };
      const updateInfo = {
        $set: { complete },
      };
      const result = await taskCollection.updateOne(
        taskId,
        updateInfo,
        options
      );
      res.send(result);
    });

    //   delete a task
    app.delete("/delete", async (req, res) => {
      const taskId = req.body.taskId;
      const userId = req.body.userId;
      const query = { _id: ObjectId(taskId) };
      const deleteTask = await taskCollection.deleteOne(query);
      const tasks = await taskCollection.find({ userId }).toArray();
      res.send(tasks);
    });
  } finally {
    // client.close()
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Soft Note Server");
});

app.listen(port, () => {
  console.log("Soft Note Server is running on: ", port);
});
