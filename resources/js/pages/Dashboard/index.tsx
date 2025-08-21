import { useAuth, useDashboardStats } from '@/hooks';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  return (
    <div className="min-h-screen bg-secondary">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Welcome Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Welcome Message - 2/3 width */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 sm:p-6 hover-lift animate-slide-up">
              <h2 className="text-xl sm:text-2xl font-bold text-secondary mb-3 sm:mb-4 animate-fade-in">
                Welcome back, {user?.name?.split(' ')[0] || 'DJ'}!
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-secondary animate-slide-up animation-delay-100">
                  Welcome To Your Event Planner!
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed animate-slide-up animation-delay-200">
                  Use the navigation tabs at the top of the page to navigate through your DJ portal.
                </p>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                  <div className="animate-slide-up animation-delay-300 hover:text-brand transition-colors duration-300">
                    <span className="font-medium text-brand">Home</span> - displays your most recent
                    event, quick actions, upcoming meetings, and account statistics.
                  </div>
                  <div className="animate-slide-up animation-delay-400 hover:text-brand transition-colors duration-300">
                    <span className="font-medium text-brand">My Events</span> - complete list of all
                    your upcoming and past wedding events.
                  </div>
                  <div className="animate-slide-up animation-delay-500 hover:text-brand transition-colors duration-300">
                    <span className="font-medium text-brand">My Profile</span> - manage your contact
                    information and DJ business details.
                  </div>
                  <div className="animate-slide-up animation-delay-500 hover:text-brand transition-colors duration-300">
                    <span className="font-medium text-brand">Contact</span> - reach out to us if you
                    need assistance or have questions.
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card - 1/3 width */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-4 sm:p-6 hover-lift animate-slide-up animation-delay-200">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand rounded-full flex items-center justify-center text-secondary font-bold text-lg sm:text-xl shadow-sm animate-float hover:animate-bounce-subtle">
                  {user?.name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase() || 'DJ'}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-secondary animate-slide-in-left">
                    {user?.name}
                  </h3>
                  <p className="text-gray-600 text-sm animate-slide-in-left animation-delay-100">
                    {user?.organization}
                  </p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm border-t pt-3 sm:pt-4">
                <div className="flex justify-between animate-slide-up animation-delay-300 hover:bg-gray-50 p-1 rounded transition-colors duration-200">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-secondary truncate ml-2">{user?.email}</span>
                </div>
                <div className="flex justify-between animate-slide-up animation-delay-400 hover:bg-gray-50 p-1 rounded transition-colors duration-200">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-secondary">
                    {user?.cell_phone || user?.home_phone || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between animate-slide-up animation-delay-500 hover:bg-gray-50 p-1 rounded transition-colors duration-200">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium text-secondary">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover-lift animate-slide-up animation-delay-300">
            <h2 className="text-lg sm:text-xl font-bold text-secondary mb-3 sm:mb-4 animate-slide-in-left">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Link
                to="/events/create"
                className="flex flex-col items-center justify-center bg-brand hover:bg-brand-dark text-secondary font-medium py-4 sm:py-6 px-3 sm:px-4 rounded-lg transition-all duration-300 group hover-lift animate-glow hover:scale-105"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300 animate-bounce-subtle">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm sm:text-base">Create Event</span>
              </Link>
              <Link
                to="/profile"
                className="flex flex-col items-center justify-center bg-secondary hover:bg-secondary-light text-white font-medium py-4 sm:py-6 px-3 sm:px-4 rounded-lg transition-all duration-300 group hover-lift animation-delay-100 hover:scale-105"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-float">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm sm:text-base">Update Profile</span>
              </Link>
              <Link
                to="/contact"
                className="flex flex-col items-center justify-center bg-brand/20 hover:bg-brand/30 text-secondary font-medium py-4 sm:py-6 px-3 sm:px-4 rounded-lg transition-all duration-300 group sm:col-span-2 lg:col-span-1 hover-lift animation-delay-200 hover:scale-105"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand/30 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300 animate-pulse-slow">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm sm:text-base">Contact Us</span>
              </Link>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover-lift animate-slide-up animation-delay-400">
            <h2 className="text-lg sm:text-xl font-bold text-secondary mb-3 sm:mb-4 animate-slide-in-left">
              Account Statistics
            </h2>
            {statsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="text-center animate-pulse">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse-slow"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 mx-auto animate-pulse-slow"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center group cursor-pointer hover-scale animate-scale-in">
                  <div className="text-2xl sm:text-3xl font-bold text-brand mb-1 sm:mb-2 group-hover:animate-bounce-subtle">
                    {stats?.totalEvents || 0}
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base group-hover:text-brand transition-colors duration-300">
                    Total Events
                  </div>
                </div>
                <div className="text-center group cursor-pointer hover-scale animate-scale-in animation-delay-100">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary mb-1 sm:mb-2 group-hover:animate-bounce-subtle">
                    {stats?.upcomingEvents || 0}
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base group-hover:text-secondary transition-colors duration-300">
                    Upcoming Events
                  </div>
                </div>
                <div className="text-center group cursor-pointer hover-scale animate-scale-in animation-delay-200">
                  <div className="text-2xl sm:text-3xl font-bold text-brand mb-1 sm:mb-2 group-hover:animate-bounce-subtle">
                    {stats?.profileCompletion || 0}%
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base group-hover:text-brand transition-colors duration-300">
                    Profile Complete
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
