import express from "express";
import cookieParser from "cookie-parser";
import healthRoutes from './routes/health.js'
import authRoutes from './modules/auth/auth.route.js'
import userRoutes from './modules/users/user.route.js'

const app = express();

app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);

export default app;
