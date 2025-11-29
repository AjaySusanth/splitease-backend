import express from "express";
import cookieParser from "cookie-parser";
import healthRoutes from './routes/health'
import authRoutes from './modules/auth/auth.route'
import userRoutes from './modules/users/user.route'

const app = express();

app.use(express.json());
app.use(cookieParser());

// Health check
app.use('/api', healthRoutes);

// Auth
app.use('/api', authRoutes);

// User
app.use('/api', userRoutes);

export default app;
