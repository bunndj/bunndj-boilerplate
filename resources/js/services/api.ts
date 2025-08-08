import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Add CSRF token to requests
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    api.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Add auth token to requests if available
const addAuthToken = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Set initial auth token
addAuthToken();

// Listen for storage changes to update auth token
window.addEventListener('storage', (e) => {
    if (e.key === 'auth_token') {
        addAuthToken();
    }
});

// Types
export interface User {
    id: number;
    name: string;
    email: string;
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
    password: string;
    password_confirmation: string;
}

// Authentication functions
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/register', credentials);
    return response.data;
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/login', credentials);
    return response.data;
};

export const logout = async (): Promise<{ message: string }> => {
    const response = await api.post('/api/logout');
    return response.data;
};

export default api;
