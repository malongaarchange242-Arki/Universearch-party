/**
 * API Response Wrapper
 * Standardizes all API responses for consistency
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Success Response Helper
 */
export const successResponse = <T>(
  message: string,
  data?: T
): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

/**
 * Error Response Helper
 */
export const errorResponse = (
  message: string,
  error?: string
): ApiResponse<null> => ({
  success: false,
  message,
  error: error || message,
});

/**
 * Paginated Response Interface
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Paginated Response Helper
 */
export const paginatedResponse = <T>(
  message: string,
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> => ({
  success: true,
  message,
  data,
  pagination: {
    page,
    limit,
    total,
  },
});
