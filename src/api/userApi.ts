import type { User, UsersApiResponse, PaginationParams } from '@/types';

const API_BASE = '/api';

/**
 * Custom error class for API errors with more context
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Parse error response and throw with details
 */
const handleApiError = async (response: Response, context: string): Promise<never> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let details: Record<string, any> = {};
  
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      details = await response.json();
    }
  } catch {
    // Ignore JSON parsing errors
  }

  const errorMessage = (details.message as string | undefined) || `${context}: ${response.statusText}`;
  throw new ApiError(response.status, response.statusText, errorMessage, details);
};

/**
 * Fetch users with pagination and filters
 */
export const fetchUsers = async (
  params: PaginationParams
): Promise<UsersApiResponse> => {
  try {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
    });

    if (params.query) {
      searchParams.set('query', params.query);
    }

    if (params.status && params.status !== 'all') {
      searchParams.set('status', params.status);
    }

    if (params.sortBy) {
      searchParams.set('sortBy', params.sortBy);
      if (params.sortOrder) {
        searchParams.set('sortOrder', params.sortOrder);
      }
    }

    const response = await fetch(`${API_BASE}/users?${searchParams}`, {
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch users');
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle network errors and timeouts
    if (error instanceof TypeError) {
      throw new ApiError(0, 'Network Error', 'Network request failed. Please check your connection.');
    }
    throw error;
  }
};

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = async (
  userId: string,
  status: 'active' | 'inactive'
): Promise<{ success: boolean; data: User; message: string }> => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!response.ok) {
      await handleApiError(response, 'Failed to update user status');
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError(0, 'Network Error', 'Network request failed. Please try again.');
    }
    throw error;
  }
};

