import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use your Mac's local IP for mobile, localhost for web
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  // Your Mac's local IP address (from the Expo QR code URL)
  return 'http://192.168.1.35:3000';
};

const API_BASE_URL = getApiBaseUrl();
const AUTH_TOKEN_KEY = 'auth_token';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Token storage utilities with platform-specific handling
export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(AUTH_TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token format');
      }

      if (Platform.OS === 'web') {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw error;
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw error;
    }
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear stored token
      await tokenStorage.removeToken();
    }
    return Promise.reject(error);
  }
);

// Signup data interface
export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  passwordConfirmation: string;
}

// Rails API response types
interface RailsUserResponse {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  country_code?: string;
  full_phone?: string;
}

interface RailsAuthSuccessResponse {
  status: 'success';
  message: string;
  data: {
    user: RailsUserResponse;
    token: string;
  };
}

interface RailsAuthErrorResponse {
  status?: 'error';
  message?: string;
  error?: string;
  errors?: string[];
}

// Normalized user for the app (camelCase)
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  countryCode?: string;
  fullPhone?: string;
}

// Normalized auth response for the app
export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: string[];
}

// Helper to convert Rails user response to app User format
function normalizeUser(railsUser: RailsUserResponse): User {
  return {
    id: railsUser.id,
    email: railsUser.email,
    firstName: railsUser.first_name,
    lastName: railsUser.last_name,
    fullName: railsUser.full_name,
    phone: railsUser.phone,
    countryCode: railsUser.country_code,
    fullPhone: railsUser.full_phone,
  };
}

// Auth API endpoints
export const authApi = {
  async register(data: SignupData): Promise<AuthResponse> {
    const response = await api.post<RailsAuthSuccessResponse>('/auth/register', {
      user: {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        country_code: data.countryCode || '+91',
        password: data.password,
        password_confirmation: data.passwordConfirmation,
      },
    });
    // Extract from Rails nested response format
    return {
      token: response.data.data.token,
      user: normalizeUser(response.data.data.user),
    };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<RailsAuthSuccessResponse>('/auth/login', {
      user: {
        email,
        password,
      },
    });
    // Extract from Rails nested response format
    return {
      token: response.data.data.token,
      user: normalizeUser(response.data.data.user),
    };
  },

  async logout(): Promise<void> {
    await api.delete('/auth/logout');
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/password', {
      user: {
        current_password: currentPassword,
        new_password: newPassword,
      },
    });
  },
};

// Helper to extract error message from API errors
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<RailsAuthErrorResponse>;
    const data = axiosError.response?.data;

    // Handle login error format: { "error": "Invalid email or password." }
    if (data?.error) {
      return data.error;
    }

    // Handle register/general error format: { "message": "...", "errors": [...] }
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.join(', ');
    }

    if (data?.message) {
      return data.message;
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export default api;
