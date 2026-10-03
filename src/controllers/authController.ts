import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js'; // adjust the path if your pool file is located elsewhere


export const registerUser = async (req: Request, res: Response) => {
  // 1. Accept username or name from the request body
  const { username, name, email, password, role, userRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // 2. Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Pick whichever username/role was sent in body
    const finalUsername = username || name || `user_${Date.now()}`;
    const finalRole = userRole || role || 'user';

    // 4. Insert into database
    const result = await pool.query(
      'INSERT INTO users (username, email, password, "userRole") VALUES ($1, $2, $3, $4) RETURNING id, username, email, "userRole"',
      [finalUsername, email, hashedPassword, finalRole]
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Username or email already exists.' });
    }

    return res.status(500).json({ message: 'Server error during registration' });
  }
};
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check if password column is null
    if (!user.password) {
      return res.status(400).json({ message: 'User record has no valid password setup' });
    }

    // Compare plain-text password against hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
  { id: user.id, email: user.email }, // <--- Is it 'id' or 'user_id'?
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '1h' }
);
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.userRole },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};
export const getProfile = async (req: Request, res: Response) => {
  try {
    // 1. Make sure key name matches the JWT payload above!
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID missing from token.' });
    }

    // 2. Fetch user profile from database (excluding password hash!)
    const result = await pool.query(
      'SELECT id, username, email, "userRole" FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile retrieval error:', error); // <--- This logs the real reason
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};