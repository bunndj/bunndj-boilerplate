import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
    const { user, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">Welcome, {user?.name}!</span>
                            <button
                                onClick={handleLogout}
                                disabled={isLoading}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                            >
                                {isLoading ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    {/* Welcome Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Welcome to Your Dashboard
                        </h2>
                        <p className="text-gray-600 mb-6">
                            This is your personal dashboard where you can manage your account.
                        </p>

                        {/* User Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-800 mb-3">
                                Your Profile
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Name:</span>
                                    <span className="font-medium text-blue-800">{user?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Email:</span>
                                    <span className="font-medium text-blue-800">{user?.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Member since:</span>
                                    <span className="font-medium text-blue-800">
                                        {user?.created_at
                                            ? new Date(user.created_at).toLocaleDateString()
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                                Update Profile
                            </button>
                            <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                                Change Password
                            </button>
                            <button className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                                View Settings
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Account Statistics</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">1</div>
                                <div className="text-gray-600">Active Sessions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-indigo-600 mb-2">0</div>
                                <div className="text-gray-600">Recent Activities</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-600 mb-2">100%</div>
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