const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Instant Mechanic - Live Ops Dashboard API',
      version: '1.0.0',
      description:
        'REST API powering the Live Vehicle Service Operations Dashboard. ' +
        'Real-time booking/mechanic updates are also pushed over WebSocket ' +
        '(see README for event names).',
    },
    servers: [{ url: '/' }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
