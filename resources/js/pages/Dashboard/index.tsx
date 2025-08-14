import { useAuth } from '@/hooks/useAuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-secondary">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-secondary mb-4">Welcome to Your Dashboard</h2>
            <p className="text-gray-600 mb-6">
              This is your personal dashboard where you can manage your account.
            </p>

            {/* User Info */}
            <div className="bg-brand/10 border border-brand/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-secondary mb-3">Your Profile</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Name:</span>
                  <span className="font-medium text-secondary">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Email:</span>
                  <span className="font-medium text-secondary">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Member since:</span>
                  <span className="font-medium text-secondary">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="bg-brand hover:bg-brand-dark text-secondary font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                Update Profile
              </button>
              <button className="bg-secondary hover:bg-secondary-light text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                Change Password
              </button>
              <button className="bg-brand/20 hover:bg-brand/30 text-secondary font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                View Settings
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">Account Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand mb-2">1</div>
                <div className="text-gray-600">Active Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">0</div>
                <div className="text-gray-600">Recent Activities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand mb-2">100%</div>
                <div className="text-gray-600">Profile Complete</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
