import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Connection test
pool.connect()
  .then((client) => {
    console.log('Successfully connected to Neon DB!');
    client.release();
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
  });