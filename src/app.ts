import express from "express";
import cookieParser from "cookie-parser";
import healthRoutes from './routes/health'
import authRoutes from './modules/auth/auth.route'
import userRouter from './modules/users/user.route';

const app = express();

app.use(express.json());
app.use(cookieParser());

// Health check
app.use('/api', healthRoutes);

// Auth
app.use('/api', authRoutes);

// Users
app.use('/api', userRouter);

export default app;
