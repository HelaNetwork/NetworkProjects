import express from 'express';
import { adminAuth } from '../middleware/adminAuth';
import {
  loginAdmin,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getAirdrops,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop
} from '../controllers/admin.controller';

const router = express.Router();

// Auth
router.post('/login', loginAdmin);

// Admin-protected routes
router.use(adminAuth);

// Events
router.get('/events', getEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

// Jobs
router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

// Airdrops
router.get('/airdrops', getAirdrops);
router.post('/airdrops', createAirdrop);
router.put('/airdrops/:id', updateAirdrop);
router.delete('/airdrops/:id', deleteAirdrop);

export default router;
