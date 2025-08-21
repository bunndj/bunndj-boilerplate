import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/Notification/NotificationContainer';
import { Routes } from './routes';

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(
    <QueryProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes />
            <NotificationContainer />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
