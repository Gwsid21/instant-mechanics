require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { initSockets } = require('./sockets');
const { startSimulator } = require('./seed/simulator');

const dashboardRoutes = require('./routes/dashboard');
const bookingsRoutes = require('./routes/bookings');
const mechanicsRoutes = require('./routes/mechanics');
const customersRoutes = require('./routes/customers');

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

async function main() {
  await connectDB();

  const app = express();
  app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());

  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/mechanics', mechanicsRoutes);
  app.use('/api/customers', customersRoutes);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

  app.use(notFound);
  app.use(errorHandler);

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN, credentials: true },
  });
  initSockets(io);

  httpServer.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
    console.log(`[server] API docs at http://localhost:${PORT}/api-docs`);
  });

  if (process.env.ENABLE_SIMULATOR !== 'false') {
    startSimulator();
  }
}

main().catch((err) => {
  console.error('[server] fatal startup error:', err);
  process.exit(1);
});
