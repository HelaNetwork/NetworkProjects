const express = require("express");
const router = express.Router();
const {
  loginOrRegister,
  getUserByWallet,
  updateProfile,
  searchUsers,
  getSuggestedUsers,
} = require("../controllers/userController");

router.post("/auth", loginOrRegister);
router.get("/search", searchUsers);
router.get("/:address", getUserByWallet);
router.put("/:address", updateProfile);
router.get("/:address/suggestions", getSuggestedUsers);

module.exports = router;
