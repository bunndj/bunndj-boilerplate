import { Role, Permission } from '@/constants/roles';

// Authentication related types
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  organization?: string;
  website?: string;
  home_phone?: string;
  cell_phone?: string;
  work_phone?: string;
  fax_phone?: string;
  address?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  role: Role;
  sms_consent: boolean;
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  organization?: string;
  phone?: string;
  role?: string;
  invitation_id?: number;
}

export interface RoleHelpers {
  isAdmin: boolean;
  isDj: boolean;
  isClient: boolean;
  role: Role | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canViewAllEvents: boolean;
  canViewOwnEvents: boolean;
  canViewInvitedEvents: boolean;
  canManageUsers: boolean;
  canViewAllUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canEditPlanning: boolean;
  canViewPlanning: boolean;
  canUploadDocuments: boolean;
  canUseChat: boolean;
  canSendInvitations: boolean;
  canViewDashboard: boolean;
  canManageSystem: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    username: string,
    password: string,
    password_confirmation: string,
    organization?: string,
    phone?: string,
    role?: string,
    invitationId?: number
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  updateUser: (userData: User) => void;
  setAuth: (userData: User, token: string) => void;
  // Role-based helpers
  isAdmin: boolean;
  isDj: boolean;
  isClient: boolean;
  role: Role | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canViewAllEvents: boolean;
  canViewOwnEvents: boolean;
  canViewInvitedEvents: boolean;
  canManageUsers: boolean;
  canViewAllUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canEditPlanning: boolean;
  canViewPlanning: boolean;
  canUploadDocuments: boolean;
  canUseChat: boolean;
  canSendInvitations: boolean;
  canViewDashboard: boolean;
  canManageSystem: boolean;
}
