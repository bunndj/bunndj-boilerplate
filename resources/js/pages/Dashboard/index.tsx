import { Link } from 'react-router-dom';
import { User, Users, Calendar } from 'lucide-react';
import { useRole, useRoleHelpers } from '@/hooks';

function Dashboard() {
  const { user, isAdmin, isDj, isClient } = useRole();
  const { getRoleDisplayName } = useRoleHelpers();

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Role-based dashboard content
  const getDashboardContent = () => {
    if (isAdmin) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Admin Dashboard</h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">Manage users, events, and system settings.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Link
                to="/admin/users"
                className="bg-brand hover:bg-brand-dark text-white p-3 sm:p-4 rounded-lg text-center transition-all duration-200 hover:scale-105 min-h-[80px] flex flex-col items-center justify-center"
              >
                <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                <span className="text-sm sm:text-base">Manage Users</span>
              </Link>
              <Link
                to="/admin/events"
                className="bg-blue-500 hover:bg-blue-600 text-white p-3 sm:p-4 rounded-lg text-center transition-all duration-200 hover:scale-105 min-h-[80px] flex flex-col items-center justify-center"
              >
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                <span className="text-sm sm:text-base">All Events</span>
              </Link>
              <Link
                to="/profile"
                className="bg-gray-500 hover:bg-gray-600 text-white p-3 sm:p-4 rounded-lg text-center transition-all duration-200 hover:scale-105 min-h-[80px] flex flex-col items-center justify-center"
              >
                <User className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                <span className="text-sm sm:text-base">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (isClient) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Dashboard</h2>
            <p className="text-gray-600 mb-4">View your events and communicate with your DJ.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/client/events"
                className="bg-brand hover:bg-brand-dark text-white p-4 rounded-lg text-center"
              >
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                My Events
              </Link>
              <Link
                to="/profile"
                className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-lg text-center"
              >
                <User className="w-8 h-8 mx-auto mb-2" />
                Profile
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (isDj) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">DJ Dashboard</h2>
            <p className="text-gray-600 mb-4">Manage your events and clients.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/events"
                className="bg-brand hover:bg-brand-dark text-white p-4 rounded-lg text-center"
              >
                <Calendar className="w-8 h-8 mx-auto mb-2" />
                My Events
              </Link>
              <Link
                to="/profile"
                className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-lg text-center"
              >
                <User className="w-8 h-8 mx-auto mb-2" />
                Profile
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-300">Welcome to your dashboard.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-secondary">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand animate-fade-in">
            Welcome back, {user.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-300">
            Role: <span className="font-semibold">{getRoleDisplayName()}</span>
          </p>
        </div>

        {/* Role-based Content */}
        {getDashboardContent()}
      </div>
    </div>
  );
}

export default Dashboard;
