/**
 * Auth Model Types
 */

export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  school?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  school?: string | null;
  createdAt: Date;
}

export interface AuthTokenDto {
  userId: string;
  expiresIn?: number;
}
