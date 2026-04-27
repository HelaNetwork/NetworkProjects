const User = require("../models/User");

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { followerAddress, targetAddress } = req.body;
    const follower = followerAddress.toLowerCase();
    const target = targetAddress.toLowerCase();

    if (follower === target) return res.status(400).json({ message: "Cannot follow yourself" });

    const [followerUser, targetUser] = await Promise.all([
      User.findOne({ walletAddress: follower }),
      User.findOne({ walletAddress: target }),
    ]);

    if (!followerUser || !targetUser)
      return res.status(404).json({ message: "User not found" });

    if (followerUser.following.includes(target))
      return res.status(409).json({ message: "Already following" });

    followerUser.following.push(target);
    targetUser.followers.push(follower);

    await Promise.all([followerUser.save(), targetUser.save()]);
    res.json({ message: "Followed successfully", following: followerUser.following });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { followerAddress, targetAddress } = req.body;
    const follower = followerAddress.toLowerCase();
    const target = targetAddress.toLowerCase();

    const [followerUser, targetUser] = await Promise.all([
      User.findOne({ walletAddress: follower }),
      User.findOne({ walletAddress: target }),
    ]);

    if (!followerUser || !targetUser)
      return res.status(404).json({ message: "User not found" });

    followerUser.following = followerUser.following.filter((a) => a !== target);
    targetUser.followers = targetUser.followers.filter((a) => a !== follower);

    await Promise.all([followerUser.save(), targetUser.save()]);
    res.json({ message: "Unfollowed successfully", following: followerUser.following });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get followers list
exports.getFollowers = async (req, res) => {
  try {
    const addr = req.params.address.toLowerCase();
    const user = await User.findOne({ walletAddress: addr });
    if (!user) return res.status(404).json({ message: "User not found" });

    const followers = await User.find({ walletAddress: { $in: user.followers } });
    res.json(followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get following list
exports.getFollowing = async (req, res) => {
  try {
    const addr = req.params.address.toLowerCase();
    const user = await User.findOne({ walletAddress: addr });
    if (!user) return res.status(404).json({ message: "User not found" });

    const following = await User.find({ walletAddress: { $in: user.following } });
    res.json(following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
