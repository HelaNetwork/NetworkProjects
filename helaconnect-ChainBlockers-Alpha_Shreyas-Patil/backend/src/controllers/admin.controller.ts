import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model';
import Event from '../models/event.model';
import Job from '../models/job.model';
import Airdrop from '../models/airdrop.model';

// --- AUTH ---

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// --- EVENTS ---

export const getEvents = async (_req: Request, res: Response) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      source: req.body.source || 'Admin',
      sourceUrl: req.body.sourceUrl || '#',
      organizer: req.body.organizer || 'Admin',
      address: req.body.address || req.body.location || 'Online',
      isActive: true,
    };
    const event = new Event(data);
    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    console.error('Create event error:', error.message);
    res.status(400).json({ success: false, message: error.message || 'Failed to create event', error });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
    if (!event) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// --- JOBS ---

export const getJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      source: req.body.source || 'Admin',
      sourceUrl: req.body.sourceUrl || '#',
      role: req.body.role || 'Engineering',
      location: req.body.location || 'Remote',
      type: req.body.type || 'full-time',
      skills: req.body.skills || [],
      postedAt: req.body.postedAt || 'Recently',
      isActive: true,
    };
    const job = new Job(data);
    await job.save();
    res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    console.error('Create job error:', error.message);
    res.status(400).json({ success: false, message: error.message || 'Failed to create job', error });
  }
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
    if (!job) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// --- AIRDROPS ---

export const getAirdrops = async (_req: Request, res: Response) => {
  try {
    const airdrops = await Airdrop.find().sort({ createdAt: -1 });
    res.json({ success: true, data: airdrops });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const createAirdrop = async (req: Request, res: Response) => {
  try {
    const airdrop = new Airdrop({ ...req.body, isActive: true });
    await airdrop.save();
    res.status(201).json({ success: true, data: airdrop });
  } catch (error: any) {
    console.error('Create airdrop error:', error.message);
    res.status(400).json({ success: false, message: error.message || 'Failed to create airdrop', error });
  }
};

export const updateAirdrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const airdrop = await Airdrop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
    if (!airdrop) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json({ success: true, data: airdrop });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const deleteAirdrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const airdrop = await Airdrop.findByIdAndDelete(req.params.id);
    if (!airdrop) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
