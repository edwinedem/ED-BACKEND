// src/routes/auth.ts
import { Router } from 'express';
import { registerUser, loginUser, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route
router.get('/profile', authenticateToken, getProfile);

export default router;