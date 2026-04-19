import express from 'express';
import dotenv from 'dotenv';
import { db, auth } from './config/firebase'; // Import db and auth from firebase config
import authMiddleware from './middleware/authMiddleware'; // Import authMiddleware
import mainRouter from './routes'; // Import the main router

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('HireReady Backend is running!');
});

// Example of a protected route
app.get('/protected', authMiddleware, (req: express.Request & { user?: { uid: string } }, res) => {
  res.send(`Welcome, authenticated user: ${req.user?.uid}`);
});

app.use('/api', mainRouter); // Use the main router for all API routes

// TODO: Import and use your API routes here
// import authRoutes from './routes/authRoutes';
// app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
