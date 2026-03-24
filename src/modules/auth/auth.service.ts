import { AuthRepository } from './auth.repository';
import { MockAuthRepository } from './auth.repository.mock';
import { CreateUserDto, UserResponse } from './auth.model';
import { validateEmail, validatePhone } from '../../shared/utils';
import { config } from '../../config/env';

/**
 * Auth Service
 * Contains business logic for authentication
 */
export class AuthService {
  private repository: AuthRepository | MockAuthRepository;

  constructor() {
    if (config.useMockDatabase) {
      console.warn('⚠️ Using MOCK database for testing');
      this.repository = new MockAuthRepository();
    } else {
      this.repository = new AuthRepository();
    }
  }

  /**
   * Register a new user
   */
  async registerUser(data: CreateUserDto): Promise<UserResponse> {
    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (!data.email || !validateEmail(data.email)) {
      throw new Error('Valid email is required');
    }

    if (data.phone && !validatePhone(data.phone)) {
      throw new Error('Invalid phone number format');
    }

    // Check if user already exists
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    return await this.repository.createUser(data);
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserResponse> {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Get or create user by email (login/registration)
   */
  async getOrCreateUser(data: CreateUserDto): Promise<UserResponse> {
    if (!validateEmail(data.email)) {
      throw new Error('Valid email is required');
    }

    try {
      // Try to find existing user
      const existingUser = await this.repository.findByEmail(data.email);
      if (existingUser) {
        return existingUser;
      }
    } catch (error) {
      console.error('Error finding user by email:', error);
      // Log the error but continue to try creating if lookup fails
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }

    // Create new user
    return await this.registerUser(data);
  }
}
