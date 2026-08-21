import express from 'express';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

const app = express();
const PORT = 3000;

// Load OpenAPI spec
const openapiSpec = JSON.parse(
  fs.readFileSync(new URL('./openapi.json', import.meta.url), 'utf8')
);

// Enable parsing of JSON request bodies
app.use(express.json());

// Serve Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// In-memory array of exactly 3 example tasks
let tasks = [
  { id: 1, title: 'Learn the basics of Express.js', done: true },
  { id: 2, title: 'Build a simple CRUD API', done: false },
  { id: 3, title: 'Deploy the backend to staging', done: false }
];

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

// Get all tasks (with optional filtering and search)
app.get('/tasks', (req, res) => {
  const { done, search } = req.query;
  let filteredTasks = [...tasks];
  
  // Validation and filtering of the 'done' parameter
  if (done !== undefined) {
    if (done !== 'true' && done !== 'false') {
      return res.status(400).json({
        error: "Query parameter 'done' must be either 'true' or 'false'"
      });
    }
    const isDone = done === 'true';
    filteredTasks = filteredTasks.filter(t => t.done === isDone);
  }
  
  // Searching by title (case-insensitive)
  if (search !== undefined) {
    const searchLower = search.toLowerCase();
    filteredTasks = filteredTasks.filter(t => t.title.toLowerCase().includes(searchLower));
  }
  
  res.status(200).json(filteredTasks);
});

// Get a task by ID
app.get('/tasks/:id', (req, res) => {
  const idParam = req.params.id;
  const taskId = parseInt(idParam, 10);
  
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({
      error: `Task ${idParam} not found`
    });
  }
  
  res.status(200).json(task);
});

// Create a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  
  // Validation: Missing, empty, or whitespace-only title
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: "Title is required and cannot be empty or whitespace only"
    });
  }
  
  // Generate the next available numeric task ID
  const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  
  const newTask = {
    id: nextId,
    title: title.trim(),
    done: false
  };
  
  tasks.push(newTask);
  
  res.status(201).json(newTask);
});

// Update an existing task
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

// Delete a task by ID
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

// Get task statistics
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

// Reset tasks list
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
