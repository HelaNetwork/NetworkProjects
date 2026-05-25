import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { seedEvents } from './services/event.service';
import { seedAdmin } from './services/admin.service';
import { seedJobs } from './services/job.service';
import userRoutes from './routes/user.routes';
import jobRoutes from './routes/job.routes';
import eventRoutes from './routes/event.routes';
import airdropRoutes from './routes/airdrop.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB then seed demo data
connectDB().then(async () => {
  await seedAdmin();
  await seedEvents();
  await seedJobs();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/airdrops', airdropRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'helaconntect API is running 🚀' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 helaconntect API running on http://localhost:${PORT}`);
});

export default app;
