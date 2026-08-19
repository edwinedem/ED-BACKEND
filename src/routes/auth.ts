// login.js (or put this inside your routes file)
import express from 'express';
import bcrypt from 'bcrypt';          // for secure password comparison
import jwt from 'jsonwebtoken';       // for generating the "code"/token
import client from "../database.ts"; // import your database client (e.g., pg for PostgreSQL)


const router = express.Router();

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1. Search the database for a matching email
    const result = await client.query(
      'SELECT  email, username, password FROM users WHERE email = $1',
      [email]
    );

    // 2. No user found → invalid credentials
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // 3. Compare the password the user typed with the one stored in the DB
    //    (We use bcrypt.compare because passwords should be hashed)
    const isMatch = await bcrypt.compare(password, user.password);

    // 4. Password does not match → invalid credentials
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 5. Password matches → generate a token (the "code") and send it to the frontend
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        userrole: user.userrole
      },//eyBSDKLFDSLKFHLKWEFLKWELKFWEefwF
      process.env.JWT_SECRET!,          // put this in your .env file
      { expiresIn: '7d' }              // token lasts 7 days (adjust as needed)
    );

    // Send the token (and optionally some user info) back to the frontend
    return res.status(200).json({
      message: 'Login successful',
      token,                           // frontend will save this (localStorage / cookie)
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userrole: user.userrole
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;