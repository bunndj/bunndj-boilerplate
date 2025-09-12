// Role constants
export const ROLES = {
  ADMIN: 'admin',
  DJ: 'dj',
  CLIENT: 'client',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Permission definitions for each role
export const PERMISSIONS = {
  // Event Management
  CREATE_EVENTS: 'create_events',
  EDIT_EVENTS: 'edit_events',
  DELETE_EVENTS: 'delete_events',
  VIEW_ALL_EVENTS: 'view_all_events',
  VIEW_OWN_EVENTS: 'view_own_events',
  VIEW_INVITED_EVENTS: 'view_invited_events',

  // User Management
  MANAGE_USERS: 'manage_users',
  VIEW_ALL_USERS: 'view_all_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',

  // Planning & Forms
  EDIT_PLANNING: 'edit_planning',
  VIEW_PLANNING: 'view_planning',
  UPLOAD_DOCUMENTS: 'upload_documents',

  // Communication
  USE_CHAT: 'use_chat',
  SEND_INVITATIONS: 'send_invitations',

  // Admin Features
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_SYSTEM: 'manage_system',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ALL_EVENTS,
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.VIEW_PLANNING,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_SYSTEM,
  ],
  [ROLES.DJ]: [
    PERMISSIONS.CREATE_EVENTS,
    PERMISSIONS.EDIT_EVENTS,
    PERMISSIONS.DELETE_EVENTS,
    PERMISSIONS.VIEW_OWN_EVENTS,
    PERMISSIONS.EDIT_PLANNING,
    PERMISSIONS.VIEW_PLANNING,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.SEND_INVITATIONS,
    PERMISSIONS.VIEW_DASHBOARD,
  ],
  [ROLES.CLIENT]: [
    PERMISSIONS.VIEW_INVITED_EVENTS,
    PERMISSIONS.VIEW_PLANNING,
    PERMISSIONS.USE_CHAT,
    PERMISSIONS.VIEW_DASHBOARD,
  ],
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role: Role, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

// Helper function to get all permissions for a role
export const getRolePermissions = (role: Role): Permission[] => {
  return ROLE_PERMISSIONS[role] ?? [];
};
