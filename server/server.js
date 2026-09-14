import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import url from 'node:url';
import requestRoutes from './routes/requestRoutes.js';
import { config } from './config/index.js';

const app = express();
const PORT = config.port;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

app.use('/api', apiLimiter);
app.use('/api', requestRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Unable to process the request' });
});

const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('server.js') ||
  url.fileURLToPath(import.meta.url) === process.argv[1]
);

if (isMainModule && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Udyam Sahayak server running on http://localhost:${PORT}`);
  });
}

export { app };
