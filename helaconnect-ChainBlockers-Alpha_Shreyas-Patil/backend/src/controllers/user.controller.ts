import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userService.createProfile(req.body);
    res.status(201).json({ success: true, data: user, message: 'Profile created' });
  } catch (error: any) {
    if (error.message === 'Profile already exists') {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet } = req.params;
    if (!wallet) { res.status(400).json({ success: false, message: 'Wallet address required' }); return; }
    const user = await userService.getUserByWallet(wallet);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet } = req.params;
    if (!wallet) { res.status(400).json({ success: false, message: 'Wallet address required' }); return; }
    const user = await userService.updateUserByWallet(wallet, req.body);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.status(200).json({ success: true, data: user, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet } = req.params;
    if (!wallet) { res.status(400).json({ success: false, message: 'Wallet address required' }); return; }
    await userService.deleteUserByWallet(wallet);
    res.status(200).json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const followUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { followerWallet, targetWallet } = req.body;
    await userService.followUser(followerWallet, targetWallet);
    res.status(200).json({ success: true, message: 'Followed user' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error', error });
  }
};

export const unfollowUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { followerWallet, targetWallet } = req.body;
    await userService.unfollowUser(followerWallet, targetWallet);
    res.status(200).json({ success: true, message: 'Unfollowed user' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error', error });
  }
};
