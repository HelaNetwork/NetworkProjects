import { Request, Response } from 'express';
import * as jobService from '../services/job.service';

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, location, type, page, limit } = req.query;
    const result = await jobService.getJobs({
      search: search as string,
      role: role as string,
      location: location as string,
      type: type as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 6,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) { res.status(404).json({ success: false, message: 'Job not found' }); return; }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
