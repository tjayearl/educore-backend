import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Fake DB for now (replace with real DB later)
let users = [];

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // ✅ VALIDATION
    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // ✅ CHECK IF USER EXISTS
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // ✅ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ ROLE LOGIC
    let userRole = "learner"; // default
    if (role === "admin") {
      userRole = "admin";
    }

    // ✅ CREATE USER
    const newUser = {
      id: Date.now(),
      full_name,
      email,
      password: hashedPassword,
      role: userRole,
    };

    users.push(newUser);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Server error. Check server logs for details.",
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ VALIDATION
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // ✅ FIND USER
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // ✅ CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      { id: user.id, role: user.role },
      "SECRET_KEY", // replace later with env variable
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server error. Check server logs for details.",
    });
  }
};