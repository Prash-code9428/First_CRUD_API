import express from 'express';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3000;

// Initialize SQLite database
const db = new Database('tasks.db');

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`);

// Seed initial tasks if table is empty
const rowCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
if (rowCount === 0) {
  const insert = db.prepare('INSERT INTO tasks (id, title, done) VALUES (?, ?, ?)');
  insert.run(1, 'Learn the basics of Express.js', 1);
  insert.run(2, 'Build a simple CRUD API', 0);
  insert.run(3, 'Deploy the backend to staging', 0);
}

// In-memory array of exactly 3 example tasks for the remaining Stage 2 endpoints (PUT, DELETE, stats, reset)
let tasks = [
  { id: 1, title: 'Learn the basics of Express.js', done: true },
  { id: 2, title: 'Build a simple CRUD API', done: false },
  { id: 3, title: 'Deploy the backend to staging', done: false }
];

// Load OpenAPI spec
const openapiSpec = JSON.parse(
  fs.readFileSync(new URL('./openapi.json', import.meta.url), 'utf8')
);

// Enable parsing of JSON request bodies
app.use(express.json());

// Serve Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Metadata endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

// GET /tasks (SQLite)
app.get('/tasks', (req, res) => {
  const { done, search } = req.query;
  
  // Validation and filtering of the 'done' parameter
  if (done !== undefined) {
    if (done !== 'true' && done !== 'false') {
      return res.status(400).json({
        error: "Query parameter 'done' must be either 'true' or 'false'"
      });
    }
  }

  let query = 'SELECT * FROM tasks';
  const params = [];
  const conditions = [];

  if (done !== undefined) {
    conditions.push('done = ?');
    params.push(done === 'true' ? 1 : 0);
  }

  if (search !== undefined) {
    conditions.push('title LIKE ?');
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  try {
    const rows = db.prepare(query).all(params);
    const mappedRows = rows.map(r => ({
      id: r.id,
      title: r.title,
      done: r.done === 1
    }));
    res.status(200).json(mappedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tasks/:id (SQLite)
app.get('/tasks/:id', (req, res) => {
  const idParam = req.params.id;
  const taskId = parseInt(idParam, 10);
  
  try {
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!row) {
      return res.status(404).json({
        error: `Task ${idParam} not found`
      });
    }
    res.status(200).json({
      id: row.id,
      title: row.title,
      done: row.done === 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks (Migrated to SQLite for Stage 2)
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  
  // Validation: Missing, empty, or whitespace-only title
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: "Title is required and cannot be empty or whitespace only"
    });
  }
  
  try {
    const trimmedTitle = title.trim();
    const info = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)').run(trimmedTitle);
    
    // Retrieve the newly created task using lastInsertRowid
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(info.lastInsertRowid));
    
    res.status(201).json({
      id: row.id,
      title: row.title,
      done: row.done === 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tasks/:id (Restored to in-memory array for Stage 2)
app.put('/tasks/:id', (req, res) => {
  const idParam = req.params.id;
  const taskId = parseInt(idParam, 10);
  
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({
      error: `Task ${idParam} not found`
    });
  }
  
  const { title, done } = req.body;
  
  // Validation: body must contain at least one valid field to update
  if (title === undefined && done === undefined) {
    return res.status(400).json({
      error: "At least one field (title or done) must be provided for update"
    });
  }
  
  // Validation: If title is provided, it must not be empty or whitespace only
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: "Title must be a non-empty string"
      });
    }
  }
  
  // Validation: If done is provided, it must be a boolean
  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({
        error: "Done status must be a boolean value"
      });
    }
  }
  
  // Update fields
  if (title !== undefined) {
    task.title = title.trim();
  }
  
  if (done !== undefined) {
    task.done = done;
  }
  
  res.status(200).json(task);
});

// DELETE /tasks/:id (Restored to in-memory array for Stage 2)
app.delete('/tasks/:id', (req, res) => {
  const idParam = req.params.id;
  const taskId = parseInt(idParam, 10);
  
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      error: `Task ${idParam} not found`
    });
  }
  
  // Remove the task from array
  tasks.splice(taskIndex, 1);
  
  // Return 204 No Content with an empty response body
  res.status(204).send();
});

// Get task statistics (Restored to in-memory array for Stage 2)
app.get('/stats', (req, res) => {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const open = total - done;
  
  res.status(200).json({
    total,
    done,
    open
  });
});

// Reset tasks list (Restored to in-memory array for Stage 2)
app.post('/reset', (req, res) => {
  tasks = [
    { id: 1, title: 'Learn the basics of Express.js', done: true },
    { id: 2, title: 'Build a simple CRUD API', done: false },
    { id: 3, title: 'Deploy the backend to staging', done: false }
  ];
  
  res.status(200).json({
    message: "Tasks list has been reset to default values"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
