import 'dotenv/config';

import express from 'express';
import helmet from 'helmet';
import { authenticationMiddleware } from './middlewares/auth.middleware.js';
import { metricsMiddleware } from './middlewares/metrics.middleware.js';
import { loggingMiddleware } from './middlewares/logging.middleware.js';
import { register } from './utils/metrics.js';
import userRouter from './routes/user.routes.js';
import urlRouter from './routes/url.routes.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(helmet());
app.use(express.json());
app.use(metricsMiddleware);
app.use(loggingMiddleware);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({
    app: 'url-shortener',
    version: '1.0.0',
    node: process.version,
    env: process.env.NODE_ENV ?? 'development',
  });
});

app.use(authenticationMiddleware);

app.get('/', (req, res) => {
  return res.json({ status: 'Server is up and running...' });
});

app.use('/user', userRouter);
app.use(urlRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
