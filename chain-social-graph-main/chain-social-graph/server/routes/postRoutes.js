const express = require("express");
const router = express.Router();
const {
  createPost,
  getFeed,
  getExploreFeed,
  getUserPosts,
  toggleLike,
  addComment,
  deletePost,
} = require("../controllers/postController");

router.post("/", createPost);
router.get("/explore", getExploreFeed);
router.get("/feed/:address", getFeed);
router.get("/user/:address", getUserPosts);
router.post("/:postId/like", toggleLike);
router.post("/:postId/comment", addComment);
router.delete("/:postId", deletePost);

module.exports = router;
