import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, User, Calendar, Mail } from 'lucide-react';
import { useNotification } from '@/hooks';

interface InvitationData {
  id: number;
  token: string;
  event: {
    id: number;
    name: string;
    event_date: string;
    venue_name: string;
    venue_city: string;
    venue_state: string;
  };
  dj: {
    id: number;
    name: string;
    organization: string;
    email: string;
  };
  client_email: string;
  client_name: string;
  status: string;
  expires_at: string;
  created_at: string;
}

function InvitationAcceptance() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invitations/${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invitation');
      }

      const data = await response.json();
      setInvitation(data.invitation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token) return;

    try {
      setAccepting(true);
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept invitation');
      }

      const data = await response.json();
      setInvitation(data.invitation);

      showNotification({
        type: 'success',
        message: 'Invitation accepted successfully! Redirecting to dashboard...',
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to accept invitation',
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleSignUp = () => {
    navigate(`/signup?invitation=${token}`);
  };

  const handleSignIn = () => {
    navigate(`/signin?invitation=${token}`);
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
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'This invitation link is invalid or has expired.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invitation.expires_at) < new Date();
  const isAccepted = invitation.status === 'accepted';

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-8">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand to-brand-dark p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            {isAccepted ? (
              <CheckCircle className="w-12 h-12 text-green-300" />
            ) : isExpired ? (
              <XCircle className="w-12 h-12 text-red-300" />
            ) : (
              <Clock className="w-12 h-12 text-yellow-300" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-center">
            {isAccepted
              ? 'Invitation Accepted'
              : isExpired
                ? 'Invitation Expired'
                : 'Wedding Event Invitation'}
          </h1>
        </div>

        {/* Content */}
        <div className="p-6">
          {isExpired ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                This invitation has expired. Please contact your DJ for a new invitation.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Go to Homepage
              </button>
            </div>
          ) : isAccepted ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                You have already accepted this invitation. You can now access your event details.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Event Details */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Event Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-brand" />
                    <div>
                      <p className="font-medium text-gray-900">{invitation.event.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(invitation.event.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-brand" />
                    <div>
                      <p className="font-medium text-gray-900">{invitation.dj.name}</p>
                      <p className="text-sm text-gray-600">{invitation.dj.organization}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-brand" />
                    <div>
                      <p className="font-medium text-gray-900">Invited Email</p>
                      <p className="text-sm text-gray-600">{invitation.client_email}</p>
                    </div>
                  </div>
                  {invitation.event.venue_name && (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div className="w-2 h-2 bg-brand rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Venue</p>
                        <p className="text-sm text-gray-600">
                          {invitation.event.venue_name}, {invitation.event.venue_city},{' '}
                          {invitation.event.venue_state}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <p className="text-center text-gray-300">
                  You've been invited to join this wedding event. Please sign in or create an
                  account to accept the invitation.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSignIn}
                    className="flex-1 bg-secondary hover:bg-secondary-light text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="flex-1 bg-brand hover:bg-brand-dark text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvitationAcceptance;
