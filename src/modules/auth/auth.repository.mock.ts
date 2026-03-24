import { CreateUserDto, UserResponse } from './auth.model';

/**
 * Mock Auth Repository for offline/testing
 * Stores users in memory instead of Supabase
 */
export class MockAuthRepository {
  private users: Map<string, UserResponse> = new Map();
  private counter: number = 0;

  async createUser(data: CreateUserDto): Promise<UserResponse> {
    console.log('📝 [MOCK] Creating user:', data.email);
    
    const id = `mock-user-${++this.counter}`;
    const user: UserResponse = {
      id,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      school: data.school || null,
      createdAt: new Date(),
    };
    
    this.users.set(data.email, user);
    console.log('✅ [MOCK] User created:', id);
    return user;
  }

  async findByEmail(email: string): Promise<UserResponse | null> {
    console.log('🔍 [MOCK] Searching user by email:', email);
    const user = this.users.get(email) || null;
    if (user) console.log('✅ [MOCK] User found:', user.id);
    else console.log('❌ [MOCK] User not found');
    return user;
  }

  async findById(id: string): Promise<UserResponse | null> {
    console.log('🔍 [MOCK] Searching user by id:', id);
    for (const user of this.users.values()) {
      if (user.id === id) {
        console.log('✅ [MOCK] User found');
        return user;
      }
    }
    console.log('❌ [MOCK] User not found');
    return null;
  }

  async getAll(): Promise<UserResponse[]> {
    console.log('📋 [MOCK] Getting all users');
    return Array.from(this.users.values());
  }
}
