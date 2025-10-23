import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'http';
import matchRoutes from './routes/match';

import authRoutes from './routes/auth';

import { connect, close } from './services/db';
import { gracefulShutdown } from './utils/gracefulShutdown';
import { sendResponse } from './utils/sendResponse';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Connect to Postgres (Neon)
connect();

// Routes
app.use('/auth', authRoutes);
app.use("/matches", matchRoutes);

// Health check
app.get('/', (req: Request, res: Response) => {
  sendResponse({
    res,
    statusCode: 200,
    data: { status: 'ok' },
    message: 'Auth service running',
  });
});

// Start server
const server: Server = app.listen(PORT, () => {
  console.log(`🚀 Auth service running on port ${PORT}`);
});

// Graceful shutdown
['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, async () => {
    gracefulShutdown(signal, server);
    await close();
  });
});
