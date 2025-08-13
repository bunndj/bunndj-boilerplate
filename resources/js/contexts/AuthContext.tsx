import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { authService } from '@/services';
import { setAuthToken } from '@/services/api-client';
import { authStorage } from '@/utils/storage';
import type { AuthContextType, User } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = () => {
    setUser(null);
    setAuthToken(null);
    authStorage.clearAuth();
  };

  const saveAuth = (userData: User, token: string) => {
    setUser(userData);
    setAuthToken(token);
    authStorage.setUser(userData);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    authStorage.setUser(userData);
  };

  // Check for existing auth on mount
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        setIsLoading(true);

        const storedUser = authStorage.getUser();
        const storedToken = authStorage.getToken();

        if (storedUser && storedToken) {
          // Set the token first
          setAuthToken(storedToken);

          // Try to verify the token is still valid
          const response = await authService.getCurrentUser();

          // If successful, use fresh user data from backend
          setUser(response.user);
          authStorage.setUser(response.user);
        } else {
          clearAuth();
        }
      } catch {
        // Token is invalid, clear auth
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      saveAuth(response.user, response.token);
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    username: string,
    password: string,
    password_confirmation: string,
    organization?: string,
    phone?: string
  ) => {
    try {
      const response = await authService.register({
        name,
        email,
        username,
        password,
        password_confirmation,
        organization,
        phone,
      });
      saveAuth(response.user, response.token);
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuth();
    }
  };

  const value: AuthContextType = {
    user,
    token: authStorage.getToken(),
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearAuth,
    updateUser,
    setAuth: saveAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
