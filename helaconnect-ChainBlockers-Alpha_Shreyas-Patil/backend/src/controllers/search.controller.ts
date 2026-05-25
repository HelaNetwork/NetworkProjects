import { Request, Response } from 'express';
import * as searchService from '../services/search.service';

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    const users = await searchService.searchUsers(q as string);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
