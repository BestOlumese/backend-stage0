import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profile.routes.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Gracefully intercept express.json() payload parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ status: 'error', message: 'Invalid JSON payload' });
  }
  next();
});

app.use('/api', profileRoutes);

// Default 404 handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

export default app;