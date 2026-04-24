const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ CONNECT MONGODB
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error:", err));

// ✅ SCHEMA
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  visits: { type: Number, default: 0 },
  reward: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);

// ✅ LOGIN
app.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ phone });
      await user.save();
    }

    // 🔥 FIX: always sync reward
    if (user.visits >= 7 && !user.reward) {
      user.reward = true;
      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ ADD VISIT
app.post("/add-visit", async (req, res) => {
  try {
    const { phone, amount } = req.body;

    let user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (amount >= 250) {
      if (user.visits < 7) {
        user.visits += 1;
      }

      // 🔥 FIX: always check reward
      if (user.visits >= 7) {
        user.reward = true;
      }

      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Visit update failed" });
  }
});

// ✅ RESET (AFTER CLAIM)
app.post("/reset", async (req, res) => {
  try {
    const { phone } = req.body;

    let user = await User.findOne({ phone });

    if (user) {
      user.visits = 0;
      user.reward = false;
      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Reset failed" });
  }
});

// ✅ GET USER
app.get("/user/:phone", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    res.json(user || {});
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("Boba Backend is running 🚀");
});

// ✅ PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});