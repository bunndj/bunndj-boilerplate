import React from 'react';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import Events from '@/pages/Events';
import EventPlanning from '@/pages/EventPlanning';
import Profile from '@/pages/Profile';
import Contact from '@/pages/Contact';
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

  // Protected Routes
  {
    path: '/dashboard',
    element: Dashboard,
    isProtected: true,
    layout: Layout,
  },
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
];

export const defaultRoute = '/signin';
export const dashboardRoute = '/dashboard';
