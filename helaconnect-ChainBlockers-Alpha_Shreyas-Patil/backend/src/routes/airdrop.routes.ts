import express from 'express';
import { getActiveAirdrops } from '../controllers/airdrop.controller';

const router = express.Router();

router.get('/', getActiveAirdrops);

export default router;
