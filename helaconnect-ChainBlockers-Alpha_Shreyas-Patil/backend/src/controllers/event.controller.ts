import { Request, Response } from 'express';
import * as eventService from '../services/event.service';

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, type, location, tag, page, limit } = req.query;
    const result = await eventService.getEvents({
      search: search as string,
      type: type as string,
      location: location as string,
      tag: tag as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 6,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
