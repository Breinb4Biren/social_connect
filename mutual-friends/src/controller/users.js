import { pool, client } from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
client.on("error", (err) => console.log("Redis Client Error", err));
const result = await client.connect();

console.log("its imported");
// Signup controller function
export const signupUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }
    console.log("comming....");
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password.toString(), saltRounds);
    console.log({ hashedPassword });
    // Insert the new user into the database
    const newUser = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );

    // Generate JWT token for the new user
    const token = jwt.sign(
      { userId: newUser.rows[0].id, username: newUser.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return the token as response
    res.status(201).json({ token });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login controller function
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user details from database based on username
    const { rows } = await pool.query(
      "SELECT id, username, password_hash AS password FROM users WHERE username = $1",
      [username]
    );

    // Check if user with the given username exists
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    // Compare the provided password with the hashed password from the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      "process.env.JWT_SECRET",
      { expiresIn: "1h" }
    );

    // Return token as response
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const verifyToken = (req, res, next) => {
  console.log(req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  console.log(token);
  console.log(jwt.verify);
  jwt.verify(token, "process.env.JWT_SECRET", (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).send("Could not verify token");
    }
    req.user = user;
    next();
  });
};

// Function to get mutual friends
export const getMutualFriends = async (req, res) => {
  const { userId1, userId2 } = req.query;

  try {
    const { rows } = await pool.query(
      "SELECT u.username AS mutual_friend FROM users u JOIN connections c1 ON u.id = c1.friend_id JOIN connections c2 ON u.id = c2.friend_id WHERE c1.user_id = $1 AND c2.user_id = $2;",
      [userId1, userId2]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to get friends of a user
export const getUserFriends = async (req, res) => {
  const { userId } = req.query;

  try {
    console.log("dasndkadkndkndksndz");
    let key = `${userId}_DB_DATA`;
    console.log({ key });
    let dataFromRedis = await result.get(key);
    console.log("-------", dataFromRedis);
    dataFromRedis = dataFromRedis ? JSON.parse(dataFromRedis) : null;
    if (!dataFromRedis) {
      dataFromRedis = await pool.query(
        "SELECT u.username AS friend FROM users u JOIN connections c ON u.id = c.friend_id WHERE c.user_id = $1;",
        [userId]
      );
    console.log({dataFromRedis});
      await result.set(key,JSON.stringify(dataFromRedis.rows))
    }
   let rows = dataFromRedis.rows ??dataFromRedis
    rows = res.json(rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to search users by name
export const searchUsersByName = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username ILIKE $1",
      [`%${q}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const verify = async (req, res) => {
  try {
    res.send("Token Verified, Authorizing User...");
  } catch (error) {}
};
