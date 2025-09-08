import { useState, useEffect } from 'react';
import { invitationService, type Invitation, type SendInvitationRequest } from '@/services';

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invitationService.getDjInvitations();
      setInvitations(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (data: SendInvitationRequest) => {
    try {
      setError(null);
      const response = await invitationService.sendInvitation(data);
      await fetchInvitations(); // Refresh the list
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const cancelInvitation = async (invitationId: number) => {
    try {
      setError(null);
      await invitationService.cancelInvitation(invitationId);
      await fetchInvitations(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel invitation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return {
    invitations,
    loading,
    error,
    fetchInvitations,
    sendInvitation,
    cancelInvitation,
  };
};

export const useClientInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invitationService.getClientInvitations();
      setInvitations(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return {
    invitations,
    loading,
    error,
    fetchInvitations,
  };
};

export const useInvitationStats = () => {
  const [stats, setStats] = useState<{
    total_invitations: number;
    pending_invitations: number;
    accepted_invitations: number;
    expired_invitations: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invitationService.getInvitationStats();
      setStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invitation stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};
