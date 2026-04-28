import { Router } from 'express';
import { getJobs, getJobById } from '../controllers/job.controller';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);

export default router;
