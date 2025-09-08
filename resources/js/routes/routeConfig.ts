import React from 'react';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import Events from '@/pages/Events';
import EventPlanning from '@/pages/EventPlanning';
import Profile from '@/pages/Profile';
import Contact from '@/pages/Contact';
import Invitation from '@/pages/Invitation';
import ClientEvents from '@/pages/ClientEvents';
import ClientEventDetails from '@/pages/ClientEventDetails';
import AdminUsers from '@/pages/AdminUsers';
import AdminEvents from '@/pages/AdminEvents';
import { Layout } from '@/components/layouts';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  isProtected?: boolean;
  isPublic?: boolean;
  layout?: React.ComponentType<{ children: React.ReactNode }>;
}

export const routes: RouteConfig[] = [
  // Public Routes
  {
    path: '/signin',
    element: SignIn,
    isPublic: true,
  },
  {
    path: '/signup',
    element: SignUp,
    isPublic: true,
  },
  {
    path: '/invitation/:id',
    element: Invitation,
    isPublic: true,
  },

  // Protected Routes - All Roles
  {
    path: '/dashboard',
    element: Dashboard,
    isProtected: true,
    layout: Layout,
  },
  {
    path: '/profile',
    element: Profile,
    isProtected: true,
    layout: Layout,
  },
  {
    path: '/contact',
    element: Contact,
    isProtected: true,
    layout: Layout,
  },

  // DJ and Admin Routes
  {
    path: '/events',
    element: Events,
    isProtected: true,
    layout: Layout,
  },
  {
    path: '/events/create',
    element: Events,
    isProtected: true,
    layout: Layout,
  },
  {
    path: '/events/:id',
    element: EventPlanning,
    isProtected: true,
    layout: Layout,
  },

  // Client Routes
  {
    path: '/client/events',
    element: ClientEvents,
    isProtected: true,
    layout: Layout,
  },
  {
    path: '/client/events/:id',
    element: ClientEventDetails,
    isProtected: true,
    layout: Layout,
  },
  {
    path: '/client/planning',
    element: EventPlanning,
    isProtected: true,
    layout: Layout,
  },

  // Admin Routes
  {
    path: '/admin/users',
    element: AdminUsers,
    isProtected: true,
    layout: Layout,
  },
  {
    path: '/admin/events',
    element: AdminEvents,
    isProtected: true,
    layout: Layout,
  },
];

export const defaultRoute = '/signin';
export const dashboardRoute = '/dashboard';
