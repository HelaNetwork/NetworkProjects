const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    }, // wallet address
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    likes: [{ type: String, lowercase: true }], // wallet addresses who liked
    comments: [
      {
        author: { type: String, lowercase: true },
        content: { type: String, maxlength: 300 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

postSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

postSchema.virtual("commentsCount").get(function () {
  return this.comments.length;
});

postSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);
