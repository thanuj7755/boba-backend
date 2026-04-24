const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let users = {};

// LOGIN
app.post("/login", (req, res) => {
  const { phone } = req.body;

  if (!users[phone]) {
    users[phone] = {
      visits: 0,
      reward: false,
    };
  }

  res.json(users[phone]);
});

// ADD VISIT (ADMIN)
app.post("/add-visit", (req, res) => {
  const { phone, amount } = req.body;

  if (!users[phone]) {
    return res.status(400).json({ error: "User not found" });
  }

  if (amount >= 250) {
    if (users[phone].visits < 7) {
      users[phone].visits += 1;
    }

    if (users[phone].visits === 7) {
      users[phone].reward = true;
    }
  }

  res.json(users[phone]);
});

// RESET AFTER REWARD (optional future use)
app.post("/reset", (req, res) => {
  const { phone } = req.body;

  users[phone].visits = 0;
  users[phone].reward = false;

  res.json(users[phone]);
});

// GET USER
app.get("/user/:phone", (req, res) => {
  res.json(users[req.params.phone]);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});