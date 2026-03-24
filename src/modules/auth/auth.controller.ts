import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { CreateUserDto } from './auth.model';
import { successResponse, errorResponse } from '../../shared/response';

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */
export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  /**
   * Register a new user
   * POST /auth/register
   */
  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, phone, school } = request.body as CreateUserDto;

      console.log('Registration request:', { name, email, phone, school });

      const user = await this.service.registerUser({
        name,
        email,
        phone,
        school,
      });

      console.log('Registration successful for user:', user.id);

      return reply.status(201).send(
        successResponse('User registered successfully', user)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      console.error('Registration error:', errorMessage, error);
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }

  /**
   * Login or register user (simplified)
   * POST /auth/login
   */
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name, email, phone } = request.body as CreateUserDto;

      const user = await this.service.getOrCreateUser({
        name: name || email.split('@')[0],
        email,
        phone,
      });

      return reply.status(200).send(
        successResponse('Authentication successful', user)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      return reply.status(400).send(errorResponse(errorMessage));
    }
  }

  /**
   * Get user profile
   * GET /auth/profile/:userId
   */
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };

      const user = await this.service.getUserProfile(userId);

      return reply.status(200).send(
        successResponse('User profile retrieved', user)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user profile';
      return reply
        .status(error instanceof Error && error.message === 'User not found' ? 404 : 400)
        .send(errorResponse(errorMessage));
    }
  }
}
