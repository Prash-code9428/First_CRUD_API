import express from 'express';

const app = express();
const PORT = 3000;

// Simple GET endpoint to verify the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Hello, the server is running successfully!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
