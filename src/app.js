import express from 'express';
import cors from 'cors';
import classifyRoutes from './routes/classify.routes.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api', classifyRoutes);

export default app;