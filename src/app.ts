import Fastify, { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs';
import { AuthController } from './modules/auth/auth.controller';
import { EventsController } from './modules/events/events.controller';
import { PaymentsController } from './modules/payments/payments.controller';
import { TicketsController } from './modules/tickets/tickets.controller';

/**
 * Create and configure Fastify application
 */
export const createApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
  });

  // CORS headers for all responses
  app.addHook('preHandler', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
      reply.code(200).send();
    }
  });

  // Initialize controllers
  const authController = new AuthController();
  const eventsController = new EventsController();
  const paymentsController = new PaymentsController();
  const ticketsController = new TicketsController();

  // ==========================================
  // HEALTH CHECK
  // ==========================================
  app.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      message: 'PassEvent API is running',
      timestamp: new Date().toISOString(),
    };
  });

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  app.post('/auth/register', (request, reply) =>
    authController.register(request, reply)
  );

  app.post('/auth/login', (request, reply) => authController.login(request, reply));

  app.get('/auth/profile/:userId', (request, reply) =>
    authController.getProfile(request, reply)
  );

  // ==========================================
  // EVENTS ROUTES
  // ==========================================
  app.get('/events', (request, reply) => eventsController.getAll(request, reply));

  app.post('/events', (request, reply) => eventsController.create(request, reply));

  app.get('/events/:eventId', (request, reply) =>
    eventsController.getById(request, reply)
  );

  app.get('/events/creator/:userId', (request, reply) =>
    eventsController.getByCreator(request, reply)
  );

  app.put('/events/:eventId', (request, reply) =>
    eventsController.update(request, reply)
  );

  app.delete('/events/:eventId', (request, reply) =>
    eventsController.delete(request, reply)
  );

  // ==========================================
  // PAYMENTS ROUTES
  // ==========================================
  app.get('/payments', (request, reply) =>
    paymentsController.getAllPayments(request, reply)
  );

  app.post('/payments', (request, reply) =>
    paymentsController.requestPayment(request, reply)
  );

  app.post('/payments/scan-qr', (request, reply) =>
    paymentsController.scanQRCode(request, reply)
  );

  app.get('/payments/status/:reference', (request, reply) =>
    paymentsController.checkPaymentStatus(request, reply)
  );

  app.get('/payments/:paymentId', (request, reply) =>
    paymentsController.getPaymentById(request, reply)
  );

  app.patch('/payments/:paymentId/validate', (request, reply) =>
    paymentsController.validatePayment(request, reply)
  );

  app.patch('/payments/:paymentId/reject', (request, reply) =>
    paymentsController.rejectPayment(request, reply)
  );

  app.get('/payments/user/:userId', (request, reply) =>
    paymentsController.getUserPayments(request, reply)
  );

  // ==========================================
  // TICKETS ROUTES
  // ==========================================
  app.get('/tickets/:ticketId', (request, reply) =>
    ticketsController.getTicketById(request, reply)
  );

  app.get('/tickets/user/:userId', (request, reply) =>
    ticketsController.getUserTickets(request, reply)
  );

  app.get('/tickets/event/:eventId', (request, reply) =>
    ticketsController.getEventTickets(request, reply)
  );

  app.post('/tickets/:ticketId/use', (request, reply) =>
    ticketsController.useTicket(request, reply)
  );

  // ==========================================
  // STATIC FILES ROUTES
  // ==========================================
  // Serve Party.html
  app.get('/Party.html', async (request, reply) => {
    try {
      const filePath = path.join(__dirname, '..', '..', 'Party.html');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      reply.type('text/html').send(fileContent);
    } catch (error) {
      reply.status(404).send({ error: 'File not found' });
    }
  });

  // ==========================================
  // ERROR HANDLING
  // ==========================================
  app.setErrorHandler((error, request, reply) => {
    console.error('❌ Error:', error);

    return reply.status(500).send({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  });

  return app;
};
