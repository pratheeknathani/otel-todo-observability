'use strict';

const express = require('express');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'todo_db';
const COLLECTION = 'todos';

const app = express();
app.use(express.json());

let db;

const SAMPLE_TODOS = [
  { id: 1, title: 'Read the OpenTelemetry documentation', completed: true },
  { id: 2, title: 'Instrument the to-do service with traces', completed: true },
  { id: 3, title: 'Run Jaeger in Docker', completed: false },
  { id: 4, title: 'Analyze the telemetry data', completed: false },
];

// GET /todo -- list every to-do item
app.get('/todo', async (req, res) => {
  const todos = await db.collection(COLLECTION).find({}).toArray();
  console.log(`GET /todo -> ${todos.length} items`);
  res.json(todos);
});

// GET /todo/:id -- fetch a single to-do item
app.get('/todo/:id', async (req, res) => {
  const id = Number(req.params.id);
  const todo = await db.collection(COLLECTION).findOne({ id });
  if (!todo) {
    console.log(`GET /todo/${id} -> not found`);
    return res.status(404).json({ error: 'todo not found' });
  }
  console.log(`GET /todo/${id} -> ${todo.title}`);
  res.json(todo);
});

// POST /todo -- create a to-do item
app.post('/todo', async (req, res) => {
  const count = await db.collection(COLLECTION).countDocuments();
  const todo = {
    id: count + 1,
    title: req.body.title || 'untitled',
    completed: false,
  };
  await db.collection(COLLECTION).insertOne(todo);
  console.log(`POST /todo -> created ${todo.id}`);
  res.status(201).json(todo);
});

async function startServer() {
  const client = await MongoClient.connect(MONGO_URL);
  db = client.db(DB_NAME);

  // seed the collection with sample data on every start
  await db.collection(COLLECTION).deleteMany({});
  await db.collection(COLLECTION).insertMany(SAMPLE_TODOS);
  console.log(`Seeded ${SAMPLE_TODOS.length} to-do items into ${DB_NAME}.${COLLECTION}`);

  app.listen(PORT, () => {
    console.log(`todo-service listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('failed to start server', err);
  process.exit(1);
});
