import { Router } from 'express';
import { getAllRooms, createRoom, updateRoom } from '../controllers/roomController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.ts';


const router = Router();

// Public: View all rooms
router.get('/', getAllRooms);

// Protected (Admin only): Only users with userRole = 'admin' can create or update rooms
router.post('/', authenticateToken, requireRole(['admin']), createRoom);
router.put('/:id', authenticateToken, requireRole(['admin']), updateRoom);

export default router;