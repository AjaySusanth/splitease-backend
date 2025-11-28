import express from "express";
import cookieParser from "cookie-parser";
import healthRoutes from './routes/health'

const app = express();

app.use(express.json());
app.use(cookieParser());

// Health check
app.use(healthRoutes);

export default app;
