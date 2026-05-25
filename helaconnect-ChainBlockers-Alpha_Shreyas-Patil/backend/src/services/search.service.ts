import User, { IUser } from '../models/user.model';

export const searchUsers = async (query: string): Promise<IUser[]> => {
  const filter: Record<string, any> = { isOnboarded: true };
  // If query provided, filter by name or wallet address
  if (query && query.trim() !== '') {
    filter.$or = [
      { fullName: { $regex: query.trim(), $options: 'i' } },
      { walletAddress: { $regex: query.trim(), $options: 'i' } },
      { bio: { $regex: query.trim(), $options: 'i' } },
    ];
  }

  return User.find(filter)
    .select('walletAddress fullName bio skills education work profileImage followers following')
    .limit(50)
    .sort({ createdAt: -1 });
};
