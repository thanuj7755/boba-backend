const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ CONNECT MONGODB
mongoose.connect("mongodb+srv://thanujpedapudi12_db_user:Thanuj123@cluster0.d0qi1ze.mongodb.net/boba?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ✅ SCHEMA
const userSchema = new mongoose.Schema({
  phone: String,
  visits: { type: Number, default: 0 },
  reward: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);

// LOGIN
app.post("/login", async (req, res) => {
  const { phone } = req.body;

  let user = await User.findOne({ phone });

  if (!user) {
    user = new User({ phone });
    await user.save();
  }

  res.json(user);
});

// ADD VISIT
app.post("/add-visit", async (req, res) => {
  const { phone, amount } = req.body;

  let user = await User.findOne({ phone });

  if (!user) return res.status(400).json({ error: "User not found" });

  if (amount >= 250) {
    if (user.visits < 7) user.visits += 1;
    if (user.visits === 7) user.reward = true;

    await user.save();
  }

  res.json(user);
});

// RESET
app.post("/reset", async (req, res) => {
  const { phone } = req.body;

  let user = await User.findOne({ phone });

  if (user) {
    user.visits = 0;
    user.reward = false;
    await user.save();
  }

  res.json(user);
});

// GET USER
app.get("/user/:phone", async (req, res) => {
  const user = await User.findOne({ phone: req.params.phone });
  res.json(user || {});
});

// ROOT
app.get("/", (req, res) => {
  res.send("Boba Backend is running 🚀");
});

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});