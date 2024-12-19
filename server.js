// /backend/server.js

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import runMigrations from './utils/runMigrations.js';

const app = express();

// CORS 설정
app.use(
    cors({
        origin: 'http://localhost:3000', // frontend server address
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

app.use(express.json( { limit: '30mb' } ));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

app.use('/api', apiRoutes);

// Backend server init
const startServer = async () => {
    try {
      await runMigrations();
      // await runSeeds();
      const port = process.env.PORT || 3001; // backend server address
      app.listen(port, () => {
        console.log(`[💥 Backend server start] : http://localost:${port}`);
      });
    } catch (error) {
      console.error('[❌ Backend server error]', error);
      process.exit(1);
    }
  };

startServer();


