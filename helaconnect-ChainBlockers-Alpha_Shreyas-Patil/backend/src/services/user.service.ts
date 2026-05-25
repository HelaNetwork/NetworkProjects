import User, { IUser } from '../models/user.model';

export const createProfile = async (data: Partial<IUser>): Promise<IUser> => {
  if (!data.walletAddress) throw new Error('Wallet address is required');
  data.walletAddress = data.walletAddress.toLowerCase();
  const existing = await User.findOne({ walletAddress: data.walletAddress });
  if (existing) {
    throw new Error('Profile already exists');
  }
  const user = new User({ ...data, isOnboarded: true });
  await user.save();
  return user;
};

export const getUserByWallet = async (walletAddress: string): Promise<IUser | null> => {
  return User.findOne({ walletAddress: walletAddress.toLowerCase() }).select('-__v');
};

export const updateUserByWallet = async (
  walletAddress: string,
  data: Partial<IUser>
): Promise<IUser | null> => {
  return User.findOneAndUpdate({ walletAddress: walletAddress.toLowerCase() }, data, { new: true, runValidators: true }).select('-__v');
};

export const deleteUserByWallet = async (walletAddress: string): Promise<void> => {
  await User.findOneAndDelete({ walletAddress: walletAddress.toLowerCase() });
};

export const followUser = async (followerWallet: string, targetWallet: string) => {
  const follower = followerWallet.toLowerCase();
  const target = targetWallet.toLowerCase();
  if (follower === target) throw new Error('Cannot follow yourself');

  // Add target to follower's following list
  await User.findOneAndUpdate({ walletAddress: follower }, { $addToSet: { following: target } });
  
  // Add follower to target's followers list
  await User.findOneAndUpdate({ walletAddress: target }, { $addToSet: { followers: follower } });
};

export const unfollowUser = async (followerWallet: string, targetWallet: string) => {
  const follower = followerWallet.toLowerCase();
  const target = targetWallet.toLowerCase();

  // Remove target from follower's following list
  await User.findOneAndUpdate({ walletAddress: follower }, { $pull: { following: target } });
  
  // Remove follower from target's followers list
  await User.findOneAndUpdate({ walletAddress: target }, { $pull: { followers: follower } });
};
