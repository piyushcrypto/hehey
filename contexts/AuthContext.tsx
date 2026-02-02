import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, tokenStorage, getErrorMessage, AuthResponse, SignupData } from '@/services/api';

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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing token on app launch
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await tokenStorage.getToken();
        if (token) {
          // Token exists, user is authenticated
          // In a production app, you might want to validate the token with the server
          // For now, we'll just trust the stored token
          setState({
            user: null, // User data would be decoded from JWT or fetched from server
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = useCallback(async (response: AuthResponse) => {
    await tokenStorage.setToken(response.token);
    setState({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      await handleAuthSuccess(response);
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  }, [handleAuthSuccess]);

  const register = useCallback(async (data: SignupData) => {
    try {
      const response = await authApi.register(data);
      await handleAuthSuccess(response);
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  }, [handleAuthSuccess]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with local logout even if server logout fails
      console.error('Server logout failed:', error);
    } finally {
      await tokenStorage.removeToken();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.updatePassword(currentPassword, newPassword);
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
