const Post = require("../models/Post");
const User = require("../models/User");

// Create post
exports.createPost = async (req, res) => {
  try {
    const { author, content } = req.body;
    if (!author || !content) return res.status(400).json({ message: "Author and content required" });

    const post = await Post.create({ author: author.toLowerCase(), content });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get feed (posts from following + self)
exports.getFeed = async (req, res) => {
  try {
    const addr = req.params.address.toLowerCase();
    const user = await User.findOne({ walletAddress: addr });
    if (!user) return res.status(404).json({ message: "User not found" });

    const authors = [addr, ...user.following];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const posts = await Post.find({ author: { $in: authors } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Enrich with author info
    const enriched = await enrichPostsWithAuthor(posts);
    res.json({ posts: enriched, page, hasMore: posts.length === limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get explore feed (all posts)
exports.getExploreFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const enriched = await enrichPostsWithAuthor(posts);
    res.json({ posts: enriched, page, hasMore: posts.length === limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get posts by a user
exports.getUserPosts = async (req, res) => {
  try {
    const addr = req.params.address.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const posts = await Post.find({ author: addr })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const enriched = await enrichPostsWithAuthor(posts);
    res.json({ posts: enriched, page, hasMore: posts.length === limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like / Unlike post
exports.toggleLike = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const addr = walletAddress.toLowerCase();
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const liked = post.likes.includes(addr);
    if (liked) {
      post.likes = post.likes.filter((a) => a !== addr);
    } else {
      post.likes.push(addr);
    }

    await post.save();
    res.json({ liked: !liked, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { author, content } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ author: author.toLowerCase(), content });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author !== walletAddress.toLowerCase())
      return res.status(403).json({ message: "Unauthorized" });

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper: enrich posts with author user data
async function enrichPostsWithAuthor(posts) {
  const addresses = [...new Set(posts.map((p) => p.author))];
  const users = await User.find({ walletAddress: { $in: addresses } });
  const userMap = {};
  users.forEach((u) => (userMap[u.walletAddress] = u));

  return posts.map((p) => ({
    ...p.toJSON(),
    authorData: userMap[p.author] || { walletAddress: p.author, username: `user_${p.author.slice(2, 8)}` },
  }));
}
