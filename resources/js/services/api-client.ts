import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add CSRF token to requests
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
  apiClient.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Token management
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }
};

// Add auth token to requests if available (legacy function for compatibility)
export const addAuthToken = () => {
  const token = localStorage.getItem('auth_token');
  setAuthToken(token);
};

// Set initial auth token
const initializeToken = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    setAuthToken(token);
  }
};

// Initialize on module load
initializeToken();

// Listen for storage changes to update auth token
window.addEventListener('storage', e => {
  if (e.key === 'auth_token') {
    const token = localStorage.getItem('auth_token');
    setAuthToken(token);
  }
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token and user data
      setAuthToken(null);
      localStorage.removeItem('auth_user');

      // Only redirect if we're not already on a public page
      const publicRoutes = ['/signin', '/signup'];
      const isPublicPage = publicRoutes.includes(window.location.pathname);
      if (!isPublicPage) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
