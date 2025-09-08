import React, { createContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { authService } from '@/services';
import { setAuthToken } from '@/services';
import { authStorage } from '@/utils/storage';
import type { AuthContextType, User } from '@/types';
import { ROLES, PERMISSIONS, hasPermission, getRolePermissions, type Role, type Permission } from '@/constants/roles';

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

  // Role-based helper functions
  const roleHelpers = useMemo(() => {
    if (!user) {
      return {
        isAdmin: false,
        isDj: false,
        isClient: false,
        role: null,
        permissions: [],
        hasPermission: () => false,
        canCreateEvents: false,
        canEditEvents: false,
        canDeleteEvents: false,
        canViewAllEvents: false,
        canViewOwnEvents: false,
        canViewInvitedEvents: false,
        canManageUsers: false,
        canViewAllUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canEditPlanning: false,
        canViewPlanning: false,
        canUploadDocuments: false,
        canUseChat: false,
        canSendInvitations: false,
        canViewDashboard: false,
        canManageSystem: false
      };
    }

    const userRole = user.role as Role;
    const userPermissions = getRolePermissions(userRole);

    return {
      isAdmin: userRole === ROLES.ADMIN,
      isDj: userRole === ROLES.DJ,
      isClient: userRole === ROLES.CLIENT,
      role: userRole,
      permissions: userPermissions,
      hasPermission: (permission: Permission) => hasPermission(userRole, permission),
      canCreateEvents: hasPermission(userRole, PERMISSIONS.CREATE_EVENTS),
      canEditEvents: hasPermission(userRole, PERMISSIONS.EDIT_EVENTS),
      canDeleteEvents: hasPermission(userRole, PERMISSIONS.DELETE_EVENTS),
      canViewAllEvents: hasPermission(userRole, PERMISSIONS.VIEW_ALL_EVENTS),
      canViewOwnEvents: hasPermission(userRole, PERMISSIONS.VIEW_OWN_EVENTS),
      canViewInvitedEvents: hasPermission(userRole, PERMISSIONS.VIEW_INVITED_EVENTS),
      canManageUsers: hasPermission(userRole, PERMISSIONS.MANAGE_USERS),
      canViewAllUsers: hasPermission(userRole, PERMISSIONS.VIEW_ALL_USERS),
      canEditUsers: hasPermission(userRole, PERMISSIONS.EDIT_USERS),
      canDeleteUsers: hasPermission(userRole, PERMISSIONS.DELETE_USERS),
      canEditPlanning: hasPermission(userRole, PERMISSIONS.EDIT_PLANNING),
      canViewPlanning: hasPermission(userRole, PERMISSIONS.VIEW_PLANNING),
      canUploadDocuments: hasPermission(userRole, PERMISSIONS.UPLOAD_DOCUMENTS),
      canUseChat: hasPermission(userRole, PERMISSIONS.USE_CHAT),
      canSendInvitations: hasPermission(userRole, PERMISSIONS.SEND_INVITATIONS),
      canViewDashboard: hasPermission(userRole, PERMISSIONS.VIEW_DASHBOARD),
      canManageSystem: hasPermission(userRole, PERMISSIONS.MANAGE_SYSTEM)
    };
  }, [user]);

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
      } catch (error: any) {
        // Handle inactive account errors differently from invalid tokens
        if (error.response?.status === 403 && error.response?.data?.message?.includes('deactivated')) {
          // For inactive accounts, the API client interceptor will handle the redirect
          // Just clear the auth here
          clearAuth();
        } else {
          // Token is invalid, clear auth
          clearAuth();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔍 [AuthContext] Attempting login for email:', email);
      const response = await authService.login({ email, password });
      console.log('✅ [AuthContext] Login successful:', response.user);
      saveAuth(response.user, response.token);
    } catch (error) {
      console.error('❌ [AuthContext] Login failed:', error);
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
    phone?: string,
    role?: string,
    invitationId?: number
  ) => {
    try {
      console.log('🔍 [AuthContext] Attempting registration:', {
        email,
        role,
        invitationId
      });
      const response = await authService.register({
        name,
        email,
        username,
        password,
        password_confirmation,
        organization,
        phone,
        role,
        invitation_id: invitationId,
      });
      console.log('✅ [AuthContext] Registration successful:', response.user);
      saveAuth(response.user, response.token);
    } catch (error) {
      console.error('❌ [AuthContext] Registration failed:', error);
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

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    token: authStorage.getToken(),
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    clearAuth,
    updateUser,
    setAuth: saveAuth,
    // Role-based helpers
    ...roleHelpers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
