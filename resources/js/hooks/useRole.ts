import { useAuth } from './useAuthContext';
import { ROLES, PERMISSIONS, type Role, type Permission } from '@/constants/roles';

/**
 * Hook for role-based functionality and permissions
 * Provides easy access to role checks and permissions
 */
export const useRole = () => {
  const {
    user,
    isAdmin,
    isDj,
    isClient,
    role,
    permissions,
    hasPermission,
    canCreateEvents,
    canEditEvents,
    canDeleteEvents,
    canViewAllEvents,
    canViewOwnEvents,
    canViewInvitedEvents,
    canManageUsers,
    canViewAllUsers,
    canEditUsers,
    canDeleteUsers,
    canEditPlanning,
    canViewPlanning,
    canUploadDocuments,
    canUseChat,
    canSendInvitations,
    canViewDashboard,
    canManageSystem
  } = useAuth();

  return {
    // User info
    user,
    role,
    permissions,
    
    // Role checks
    isAdmin,
    isDj,
    isClient,
    
    // Permission checks
    hasPermission,
    
    // Event permissions
    canCreateEvents,
    canEditEvents,
    canDeleteEvents,
    canViewAllEvents,
    canViewOwnEvents,
    canViewInvitedEvents,
    
    // User management permissions
    canManageUsers,
    canViewAllUsers,
    canEditUsers,
    canDeleteUsers,
    
    // Planning permissions
    canEditPlanning,
    canViewPlanning,
    canUploadDocuments,
    
    // Communication permissions
    canUseChat,
    canSendInvitations,
    
    // System permissions
    canViewDashboard,
    canManageSystem,
    
    // Utility functions
    isRole: (checkRole: Role) => role === checkRole,
    hasAnyPermission: (permissionList: Permission[]) => 
      permissionList.some(permission => hasPermission(permission)),
    hasAllPermissions: (permissionList: Permission[]) => 
      permissionList.every(permission => hasPermission(permission))
  };
};

/**
 * Hook for checking specific permissions
 * Useful when you only need to check one or a few permissions
 */
export const usePermission = (permission: Permission) => {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
};

/**
 * Hook for checking multiple permissions
 * Useful when you need to check several permissions at once
 */
export const usePermissions = (permissions: Permission[]) => {
  const { hasPermission } = useAuth();
  
  return {
    hasAny: permissions.some(permission => hasPermission(permission)),
    hasAll: permissions.every(permission => hasPermission(permission)),
    hasPermission: (permission: Permission) => hasPermission(permission),
    missingPermissions: permissions.filter(permission => !hasPermission(permission))
  };
};

/**
 * Hook for role-specific functionality
 * Provides role-specific helpers and constants
 */
export const useRoleHelpers = () => {
  const { role, isAdmin, isDj, isClient } = useAuth();
  
  return {
    role,
    isAdmin,
    isDj,
    isClient,
    
    // Role constants for easy access
    ROLES,
    PERMISSIONS,
    
    // Role-specific navigation
    getDashboardPath: () => {
      if (isAdmin) return '/admin/dashboard';
      if (isDj) return '/dashboard';
      if (isClient) return '/client/dashboard';
      return '/dashboard';
    },
    
    getEventsPath: () => {
      if (isAdmin) return '/admin/events';
      if (isDj) return '/events';
      if (isClient) return '/client/events';
      return '/events';
    },
    
    // Role-specific features
    canAccessAdminPanel: isAdmin,
    canAccessDjPanel: isDj || isAdmin,
    canAccessClientPanel: isClient || isAdmin,
    
    // Role display helpers
    getRoleDisplayName: () => {
      if (isAdmin) return 'Administrator';
      if (isDj) return 'DJ';
      if (isClient) return 'Client';
      return 'Unknown';
    },
    
    getRoleColor: () => {
      if (isAdmin) return 'text-red-600 bg-red-100';
      if (isDj) return 'text-blue-600 bg-blue-100';
      if (isClient) return 'text-green-600 bg-green-100';
      return 'text-gray-300 bg-gray-100';
    }
  };
};
