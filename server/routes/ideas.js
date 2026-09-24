const express = require("express");
const router = express.Router();
const Idea = require("../models/idea");

// GET all ideas
router.get("/", async (req, res) => {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new idea
router.post("/", async (req, res) => {
  try {
    const { title, tag } = req.body;
    const newIdea = new Idea({ title, tag });
    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH (toggle favorite / edit)
router.patch("/:id", async (req, res) => {
  try {
    const updatedIdea = await Idea.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedIdea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE an idea
router.delete("/:id", async (req, res) => {
  try {
    await Idea.findByIdAndDelete(req.params.id);
    res.json({ message: "Idea deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;