import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Routes } from './routes';

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(
        <AuthProvider>
            <Router>
                <Routes />
            </Router>
        </AuthProvider>
    );
}
