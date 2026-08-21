import express from 'express';

const app = express();
const PORT = 3000;

// Enable parsing of JSON request bodies
app.use(express.json());

// In-memory array of exactly 3 example tasks
const tasks = [
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

// Get all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
