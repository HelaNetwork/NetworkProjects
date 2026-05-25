import { Router } from 'express';
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  followUser,
  unfollowUser
} from '../controllers/user.controller';
import { searchUsers } from '../controllers/search.controller';

const router = Router();

router.get('/search', searchUsers);
router.post('/profile', createProfile);
router.get('/profile/:wallet', getProfile);
router.put('/profile/:wallet', updateProfile);
router.delete('/profile/:wallet', deleteProfile);

router.post('/follow', followUser);
router.post('/unfollow', unfollowUser);

export default router;
