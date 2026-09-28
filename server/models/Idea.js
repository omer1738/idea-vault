const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: "General",
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Idea", ideaSchema);