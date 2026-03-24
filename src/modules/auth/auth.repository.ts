import { supabase } from '../../config/supabase';
import { CreateUserDto, UserResponse } from './auth.model';

/**
 * Auth Repository
 * Handles all database operations for users using Supabase
 */
export class AuthRepository {
  /**
   * Create a new user
   */
  async createUser(data: CreateUserDto): Promise<UserResponse> {
    try {
      console.log('Creating user with data:', { name: data.name, email: data.email });
      
      const { data: user, error } = await supabase
        .from('users')
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            school: data.school || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error.code, error.message, error);
        throw new Error(`Failed to create user: ${error.message}`);
      }

      if (!user) {
        throw new Error('User creation returned no data');
      }

      console.log('User created successfully:', user.id);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        school: user.school,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserResponse | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select()
        .eq('email', email)
        .single();

      if (error) {
        // PGRST116 is the "no rows" error, which we expect when user doesn't exist
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Supabase findByEmail error:', error.code, error.message);
        throw new Error(`Failed to find user: ${error.message}`);
      }

      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        school: user.school,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserResponse | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find user: ${error.message}`);
    }

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      school: user.school,
      createdAt: user.createdAt,
    };
  }

  /**
   * Get all users
   */
  async getAll(): Promise<UserResponse[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select()
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      school: user.school,
      createdAt: user.createdAt,
    }));
  }
}
