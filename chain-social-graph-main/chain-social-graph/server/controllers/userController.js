const User = require("../models/User");

// Register or login with wallet
exports.loginOrRegister = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ message: "Wallet address required" });

    const addr = walletAddress.toLowerCase();
    let user = await User.findOne({ walletAddress: addr });

    if (!user) {
      // Auto-generate username from address
      const defaultUsername = `user_${addr.slice(2, 8)}`;
      user = await User.create({ walletAddress: addr, username: defaultUsername });
      return res.status(201).json({ user, isNew: true });
    }

    res.json({ user, isNew: false });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ message: "Username already taken" });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

// Get user by wallet address
exports.getUserByWallet = async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.address.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const addr = req.params.address.toLowerCase();

    // Check username uniqueness if changing
    if (username) {
      const existing = await User.findOne({ username, walletAddress: { $ne: addr } });
      if (existing) return res.status(409).json({ message: "Username already taken" });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: addr },
      { $set: { username, bio, avatar } },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { walletAddress: { $regex: q, $options: "i" } },
      ],
    }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get suggested users (not following)
exports.getSuggestedUsers = async (req, res) => {
  try {
    const addr = req.params.address.toLowerCase();
    const me = await User.findOne({ walletAddress: addr });
    if (!me) return res.status(404).json({ message: "User not found" });

    const excluded = [addr, ...me.following];
    const users = await User.find({ walletAddress: { $nin: excluded } })
      .sort({ reputationScore: -1 })
      .limit(5);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
