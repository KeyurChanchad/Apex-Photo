import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { navigate } from './navigationService';

// Types
export interface ApiConfig extends RequestInit {
  timeout?: number;
  _retry?: boolean;
  skipAuth?: boolean;
}

export interface ApiError extends Error {
  status?: number;
  data?: any;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

// Constants
const BASE_URL =
  Config.API_URL?.replace(/\/$/, '') || 'https://event.apexinfocom.in/api';

// Helper function for creating headers
const getHeaders = async (
  includeAuth: boolean = true,
): Promise<HeadersInit_> => {
  const headers: HeadersInit_ = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (includeAuth) {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }
  }

  return headers;
};

// Fetch wrapper with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number = 10000,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Token refresh logic
const handleTokenRefresh = async <T>(
  method: string,
  endpoint: string,
  data: any,
  originalConfig: ApiConfig,
): Promise<T> => {
  originalConfig._retry = true;

  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Refresh the token
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: refreshToken.trim() }),
    });

    if (!refreshResponse.ok) {
      throw new Error('Refresh failed');
    }

    const refreshData: RefreshTokenResponse = await refreshResponse.json();
    const { accessToken } = refreshData;

    if (accessToken) {
      await AsyncStorage.setItem('token', accessToken);

      // Retry the original request with new token
      const headers = await getHeaders(true);
      const retryConfig: RequestInit = {
        method,
        headers,
        ...originalConfig,
      };

      if (data) {
        retryConfig.body = JSON.stringify(data);
      }

      const retryResponse = await fetchWithTimeout(
        `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`,
        retryConfig,
        originalConfig.timeout || 10000,
      );

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        const error = new Error(
          errorData.message || `HTTP error ${retryResponse.status}`,
        ) as ApiError;
        error.status = retryResponse.status;
        error.data = errorData;
        throw error;
      }

      return (await retryResponse.json().catch(() => ({}))) as T;
    }

    throw new Error('No access token in refresh response');
  } catch (refreshError) {
    console.log('Refresh failed:', refreshError);
    // Clear storage on refresh failure
    await AsyncStorage.clear();
    throw refreshError;
  }
};

// Main request function
const request = async <T = any>(
  method: string,
  endpoint: string,
  data?: any,
  customConfig: ApiConfig = {},
): Promise<T> => {
  const url = `${BASE_URL}${
    endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  }`;
  const headers = await getHeaders(!customConfig.skipAuth);

  const config: RequestInit = {
    method,
    headers: { ...headers, ...customConfig.headers },
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetchWithTimeout(
      url,
      config,
      customConfig.timeout || 10000,
    );

    // Parse JSON response
    const responseData = (await response.json().catch(() => ({}))) as T;
    console.log('Response data ', responseData);

    // IMPLEMENT IF RESPONSE RETURN 401
    if (
      response &&
      (response.status === 401 ||
        (response as { statusCode?: number }).statusCode === 401)
    ) {
      console.log('Unauthorized access ', responseData);

      await AsyncStorage.clear();
      navigate('Auth', { name: 'Login' });
      throw new Error('Session expired');
    }

    return responseData;
  } catch (error) {
    // Handle 401 errors with token refresh
    const apiError = error as ApiError;
    if (
      apiError.status === 401 &&
      !customConfig._retry &&
      !customConfig.skipAuth
    ) {
      return handleTokenRefresh<T>(method, endpoint, data, customConfig);
    }
    throw error;
  }
};

// HTTP method wrappers with TypeScript generics
const api = {
  get: <T = any>(endpoint: string, config?: ApiConfig): Promise<T> =>
    request<T>('GET', endpoint, null, config),

  post: <T = any>(
    endpoint: string,
    data?: any,
    config?: ApiConfig,
  ): Promise<T> => request<T>('POST', endpoint, data, config),

  put: <T = any>(
    endpoint: string,
    data?: any,
    config?: ApiConfig,
  ): Promise<T> => request<T>('PUT', endpoint, data, config),

  patch: <T = any>(
    endpoint: string,
    data?: any,
    config?: ApiConfig,
  ): Promise<T> => request<T>('PATCH', endpoint, data, config),

  delete: <T = any>(endpoint: string, config?: ApiConfig): Promise<T> =>
    request<T>('DELETE', endpoint, null, config),

  // Raw fetch access for special cases (file uploads, etc.)
  raw: async (endpoint: string, options: ApiConfig = {}): Promise<Response> => {
    const url = `${BASE_URL}${
      endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    }`;
    const headers = await getHeaders(!options.skipAuth);

    return fetchWithTimeout(
      url,
      {
        ...options,
        headers: { ...headers, ...options.headers },
      },
      options.timeout || 10000,
    );
  },
};

// Type for API response structure (adjust based on your backend)
export interface StandardApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

export default api;
