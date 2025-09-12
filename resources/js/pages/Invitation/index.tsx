import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  MapPin,
  User,
  AlertCircle,
} from 'lucide-react';
import { invitationService } from '@/services/invitation';
import { useAuth } from '@/hooks';
import { useNotificationHelpers } from '@/hooks';
import type { Invitation } from '@/services/invitation';

const InvitationPage: React.FC = () => {
  console.log('🔍 [Invitation] Component rendering...');
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotificationHelpers();
  const navigate = useNavigate();

  console.log('🔍 [Invitation] Component state:', { id, isAuthenticated, user: user?.email });

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    console.log('🔍 [Invitation] useEffect triggered with:', {
      id,
      isAuthenticated,
      user: user?.email,
    });
    if (id) {
      console.log('🔍 [Invitation] Component mounted with ID:', id);
      console.log('🔍 [Invitation] Current auth state:', {
        isAuthenticated,
        user: user ? { id: user.id, email: user.email, role: user.role } : null,
      });

      // Only fetch invitation if we have the ID, regardless of auth state
      // The invitation data is needed to show the page content
      fetchInvitation();
    } else {
      console.log('❌ [Invitation] No ID provided in URL params');
    }
  }, [id]); // Remove isAuthenticated and user from dependencies to prevent refetching

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      console.log('🔍 [Invitation] Fetching invitation with ID:', id);
      const invitationData = await invitationService.getInvitationById(Number(id));
      console.log('✅ [Invitation] Invitation data received:', invitationData);
      setInvitation(invitationData);
    } catch (err) {
      console.error('❌ [Invitation] Error fetching invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    console.log('🔍 [Invitation] handleAcceptInvitation called with state:', {
      invitation: invitation ? { id: invitation.id, client_email: invitation.client_email } : null,
      isAuthenticated,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
    });

    if (!invitation) {
      console.log('❌ [Invitation] No invitation data available');
      return;
    }

    if (!isAuthenticated) {
      console.log('❌ [Invitation] User not authenticated');
      return;
    }

    if (!user) {
      console.log('❌ [Invitation] No user data available');
      return;
    }

    try {
      setAccepting(true);
      console.log('🔍 [Invitation] Accepting invitation:', {
        invitationId: invitation.id,
        userEmail: user?.email,
        invitationEmail: invitation.client_email,
        isAuthenticated,
        user,
      });

      await invitationService.acceptInvitation(invitation.id);

      console.log('✅ [Invitation] Invitation accepted successfully');
      showSuccess('Invitation Accepted!', 'You can now access your event details.');

      // Redirect to client events page
      setTimeout(() => {
        navigate('/client/events');
      }, 2000);
    } catch (err) {
      console.error('❌ [Invitation] Error accepting invitation:', err);
      showError(
        'Acceptance Failed',
        err instanceof Error ? err.message : 'Failed to accept invitation'
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleSignUp = () => {
    if (invitation) {
      navigate(`/signup?invitation_id=${invitation.id}&email=${invitation.client_email}`);
    }
  };

  const handleSignIn = () => {
    console.log('🔍 [Invitation] Redirecting to signin with invitation ID:', id);
    navigate(`/signin?redirect=/invitation/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-300">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The invitation you are looking for does not exist or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusInfo = () => {
    if (invitation.status === 'accepted') {
      return {
        icon: CheckCircle,
        text: 'Accepted',
        color: 'text-green-600 bg-green-100',
        description: 'You have already accepted this invitation.',
      };
    } else if (invitation.status === 'expired') {
      return {
        icon: XCircle,
        text: 'Expired',
        color: 'text-red-600 bg-red-100',
        description: 'This invitation has expired. Please contact your DJ for a new invitation.',
      };
    } else {
      return {
        icon: Clock,
        text: 'Pending',
        color: 'text-blue-600 bg-blue-100',
        description: 'This invitation is waiting for your acceptance.',
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand animate-fade-in">
            Event Invitation
          </h1>
          <p className="text-gray-300">You've been invited to collaborate on an event</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{invitation.event.name}</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-300">{formatDate(invitation.event.event_date)}</span>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-300">
                    {invitation.event.venue_name}, {invitation.event.venue_city},{' '}
                    {invitation.event.venue_state}
                  </span>
                </div>
              </div>
            </div>

            {/* DJ Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your DJ</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{invitation.dj.name}</h4>
                  <p className="text-gray-300">{invitation.dj.organization}</p>
                  <p className="text-sm text-gray-500">{invitation.dj.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invitation Status</h3>

              <div className="flex items-center mb-4">
                <StatusIcon className="w-6 h-6 mr-3" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{statusInfo.description}</p>

              {invitation.status === 'pending' && (
                <div className="space-y-3">
                  {!isAuthenticated ? (
                    <>
                      <p className="text-sm text-gray-600">
                        You need to sign in or create an account to accept this invitation.
                      </p>
                      <div className="space-y-2">
                        <button
                          onClick={handleSignIn}
                          className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={handleSignUp}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Create Account
                        </button>
                      </div>
                    </>
                  ) : user?.email !== invitation.client_email ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-800 font-medium">Email Mismatch</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            This invitation is for {invitation.client_email}, but you are signed in
                            as {user?.email}. Please sign out and sign in with the correct email
                            address.
                          </p>
                          <button
                            onClick={() => {
                              console.log(
                                '🔍 [Invitation] Redirecting to signin for email mismatch'
                              );
                              navigate(`/signin?redirect=/invitation/${id}`);
                            }}
                            className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 font-medium underline"
                          >
                            Sign in with correct email
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleAcceptInvitation}
                      disabled={accepting}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      {accepting ? 'Accepting...' : 'Accept Invitation'}
                    </button>
                  )}
                </div>
              )}

              {invitation.status === 'accepted' && (
                <button
                  onClick={() => navigate('/client/events')}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  View Event Details
                </button>
              )}
            </div>

            {/* Invitation Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invitation Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Invited for:</span>
                  <span className="font-medium">{invitation.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Email:</span>
                  <span className="font-medium">{invitation.client_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Expires:</span>
                  <span className="font-medium">
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;
