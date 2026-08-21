import express from 'express';

const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
