const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 160,
    },
    avatar: {
      type: String,
      default: "",
    },
    followers: [{ type: String, lowercase: true }], // wallet addresses
    following: [{ type: String, lowercase: true }], // wallet addresses
    reputationScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compute reputation score before save
userSchema.pre("save", function (next) {
  this.reputationScore =
    this.followers.length * 3 + this.following.length * 1;
  next();
});

userSchema.virtual("followersCount").get(function () {
  return this.followers.length;
});

userSchema.virtual("followingCount").get(function () {
  return this.following.length;
});

userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
