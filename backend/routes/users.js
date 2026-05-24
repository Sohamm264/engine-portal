const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const filePath = path.join(__dirname, "../data/users.json");

// Read users
function getUsers() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath));
}

// Save users
function saveUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const users = getUsers();

  const exists = users.find(u => u.email === email);

  if (exists) {
    return res.status(400).json({
      error: "User already exists"
    });
  }

  const hashed = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashed,
    role: "client",
    status: "active",
    created_at: Date.now()
  };

  users.push(newUser);
  saveUsers(users);

  res.json({
    success: true,
    message: "Signup successful"
  });
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const users = getUsers();

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(400).json({
      error: "Invalid email"
    });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({
      error: "Wrong password"
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// ================= GET USERS =================
router.get("/", (req, res) => {
  const users = getUsers().map(u => ({
    id: u.id,
    name: u.name,
    role: u.role,
    status: u.status,
    created_at: u.created_at
  }));

  res.json(users);
});

module.exports = router;