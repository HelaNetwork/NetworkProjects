const express = require("express");
const router = express.Router();
const { followUser, unfollowUser, getFollowers, getFollowing } = require("../controllers/followController");

router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);
router.get("/:address/followers", getFollowers);
router.get("/:address/following", getFollowing);

module.exports = router;
