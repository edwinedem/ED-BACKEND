import type { Request, Response } from 'express';
import { pool } from '../config/database.ts';

// 1. Get all rooms (Public route)
export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY id ASC');
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms.' });
  }
};

// 2. Add a new room (Admin/Staff)
export const createRoom = async (req: Request, res: Response) => {
  const { room_number, type, price_per_night } = req.body;

  if (!room_number || !type || !price_per_night) {
    return res.status(400).json({ error: 'room_number, type, and price_per_night are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO rooms (room_number, type, price_per_night)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [room_number, type, price_per_night]
    );

    res.status(201).json({
      message: 'Room created successfully',
      room: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation in Postgres
      return res.status(400).json({ error: 'Room number already exists.' });
    }
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room.' });
  }
};

// 3. Update room availability/details (Admin/Staff)
export const updateRoom = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { room_number, type, price_per_night, is_available } = req.body;

  try {
    const result = await pool.query(
      `UPDATE rooms 
       SET room_number = COALESCE($1, room_number),
           type = COALESCE($2, type),
           price_per_night = COALESCE($3, price_per_night),
           is_available = COALESCE($4, is_available)
       WHERE id = $5
       RETURNING *`,
      [room_number, type, price_per_night, is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    res.json({ message: 'Room updated successfully', room: result.rows[0] });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room.' });
  }
};