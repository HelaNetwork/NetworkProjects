import { Request, Response } from 'express';
import Airdrop from '../models/airdrop.model';

export const getActiveAirdrops = async (_req: Request, res: Response) => {
  try {
    const airdrops = await Airdrop.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: airdrops });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
