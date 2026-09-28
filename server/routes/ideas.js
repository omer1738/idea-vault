const express = require("express");
const router = express.Router();
const Idea = require("../models/Idea");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  try {
    const ideas = await Idea.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, tag } = req.body;
    const idea = await Idea.create({ title, tag, userId: req.userId });
    res.status(201).json(idea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const idea = await Idea.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { favorite: req.body.favorite },
      { new: true }
    );
    res.json(idea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Idea.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Idea deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;