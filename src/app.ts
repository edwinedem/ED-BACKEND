import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.ts';

dotenv.config();

const app = express();

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;