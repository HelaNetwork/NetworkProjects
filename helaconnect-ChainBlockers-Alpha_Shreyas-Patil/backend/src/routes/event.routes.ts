import { Router } from 'express';
import { getEvents } from '../controllers/event.controller';

const router = Router();

router.get('/', getEvents);

export default router;
