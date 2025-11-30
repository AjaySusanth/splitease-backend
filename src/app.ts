import express from "express";
import cookieParser from "cookie-parser";
import healthRoutes from './routes/health.js'
import authRoutes from './modules/auth/auth.route.js'
import userRoutes from "./modules/user/user.route.js";
import groupsRoutes from "./modules/groups/groups.route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/groups", groupsRoutes);

export default app;



