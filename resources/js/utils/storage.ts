// Local storage utilities with error handling
export const storage = {
  // Get item from localStorage with error handling
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },

  // Set item in localStorage with error handling
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  },

  // Remove item from localStorage with error handling
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  },

  // Clear all localStorage with error handling
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Check if localStorage is available
  isAvailable: (): boolean => {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};

// Auth-specific storage utilities
export const authStorage = {
  // Get auth token
  getToken: (): string | null => {
    return storage.getItem('auth_token');
  },

  // Set auth token
  setToken: (token: string): boolean => {
    return storage.setItem('auth_token', token);
  },

  // Remove auth token
  removeToken: (): boolean => {
    return storage.removeItem('auth_token');
  },

  // Get user data
  getUser: (): any | null => {
    try {
      const userData = storage.getItem('auth_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  },

  // Set user data
  setUser: (user: any): boolean => {
    try {
      return storage.setItem('auth_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data to localStorage:', error);
      return false;
    }
  },

  // Remove user data
  removeUser: (): boolean => {
    return storage.removeItem('auth_user');
  },

  // Clear all auth data
  clearAuth: (): boolean => {
    const tokenRemoved = authStorage.removeToken();
    const userRemoved = authStorage.removeUser();
    return tokenRemoved && userRemoved;
  },
};
