const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    // 1. Ask Google: is this login token real?
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub, email, name, picture } = ticket.getPayload();

    // 2. Find the user, or create them the first time they sign in
    let user = await User.findOne({ googleId: sub });
    if (!user) {
      user = await User.create({ googleId: sub, email, name, picture });
    }

    // 3. Give them a session pass valid for 7 days
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

module.exports = router;