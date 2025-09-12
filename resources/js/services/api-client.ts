import axios from 'axios';
import { authStorage } from '@/utils/storage';

// Create axios instance with proper Sanctum configuration
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // We're using token-based auth, not cookie-based
  timeout: 10 * 60 * 1000, // 10 minutes timeout for document uploads and AI processing
});

// Add CSRF token to requests (for stateful requests if needed)
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
  apiClient.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Token management with better error handling
export const setAuthToken = (token: string | null) => {
  try {
    if (token) {
      // Set Authorization header for API requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      authStorage.setToken(token);
    } else {
      // Remove Authorization header
      delete apiClient.defaults.headers.common['Authorization'];
      authStorage.removeToken();
    }
  } catch (error) {
    console.error('Error managing auth token:', error);
  }
};

// Get current token from localStorage
export const getAuthToken = (): string | null => {
  return authStorage.getToken();
};

// Add auth token to requests if available (legacy function for compatibility)
export const addAuthToken = () => {
  const token = getAuthToken();
  setAuthToken(token);
};

// Set initial auth token
const initializeToken = () => {
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
  }
};

// Initialize on module load
initializeToken();

// Listen for storage changes to update auth token (for multi-tab support)
window.addEventListener('storage', e => {
  if (e.key === 'auth_token') {
    const token = authStorage.getToken();
    setAuthToken(token);
  }
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Don't clear auth data for logout requests
    const isLogoutRequest = error.config?.url?.includes('/logout');

    // Handle different types of authentication errors
    if (error.response?.status === 401 && !isLogoutRequest) {
      // Clear token and user data
      setAuthToken(null);

      // Only redirect if we're not already on a public page
      const publicRoutes = ['/signin', '/signup'];
      const isPublicPage = publicRoutes.includes(window.location.pathname);

      if (!isPublicPage) {
        // Redirect to signin page
        window.location.href = '/signin';
      }
    } else if (error.response?.status === 403 && !isLogoutRequest) {
      // Handle inactive account - clear auth and redirect to signin
      const errorMessage = error.response?.data?.message;
      if (errorMessage && errorMessage.includes('deactivated')) {
        // Clear token and user data
        setAuthToken(null);
        authStorage.removeUser();

        // Only redirect if we're not already on a public page
        const publicRoutes = ['/signin', '/signup'];
        const isPublicPage = publicRoutes.includes(window.location.pathname);

        if (!isPublicPage) {
          // Store the error message for display on signin page
          sessionStorage.setItem('auth_error', errorMessage);
          // Redirect to signin page
          window.location.href = '/signin';
        }
      }
    } else if (error.response?.status === 419) {
      // CSRF token mismatch - refresh the page to get new token
      console.warn('CSRF token mismatch, refreshing page...');
      window.location.reload();
    } else if (error.response?.status === 429) {
      // Rate limiting
      console.warn('Rate limit exceeded. Please slow down your requests.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
