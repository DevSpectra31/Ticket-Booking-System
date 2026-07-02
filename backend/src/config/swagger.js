const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ReserveX - Ticket Booking System API',
      version: '1.0.0',
      description: 'API documentation for the ReserveX ticket booking platform. Supports event management, seat selection, booking, waitlisting, and QR code ticket generation.',
      contact: {
        name: 'ReserveX Support',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? "https://ticket-booking-system-w0jc.onrender.com"
          : "http://localhost:8080",
        description: process.env.NODE_ENV === 'production'
          ? "Production server"
          : "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.model.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
