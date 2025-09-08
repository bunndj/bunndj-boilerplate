import apiClient from './api-client';

export interface Invitation {
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
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface SendInvitationRequest {
  event_id: number;
  client_email: string;
  client_name?: string;
  expires_in_days?: number;
}

export interface InvitationResponse {
  invitation: Invitation;
  message: string;
}

export interface InvitationStats {
  total_invitations: number;
  pending_invitations: number;
  accepted_invitations: number;
  expired_invitations: number;
}

export const invitationService = {
  // Get invitation by ID (public)
  async getInvitationById(id: number): Promise<Invitation> {
    console.log('🔍 [InvitationService] Fetching invitation with ID:', id);
    const response = await fetch(`/api/invitations/${id}`);
    console.log('📡 [InvitationService] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [InvitationService] Error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch invitation');
    }
    const data = await response.json();
    console.log('✅ [InvitationService] Invitation data:', data);
    return data.invitation;
  },

  // Accept invitation (requires authentication)
  async acceptInvitation(id: number): Promise<InvitationResponse> {
    console.log('🔍 [InvitationService] Accepting invitation with ID:', id);
    
    try {
      const response = await apiClient.post(`/invitations/${id}/accept`);
      console.log('✅ [InvitationService] Accept success data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [InvitationService] Accept error:', error);
      console.error('❌ [InvitationService] Error response:', error.response?.data);
      console.error('❌ [InvitationService] Error status:', error.response?.status);
      throw error;
    }
  },

  // Register via invitation (public)
  async registerViaInvitation(id: number, userData: {
    name: string;
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }): Promise<InvitationResponse> {
    const response = await fetch(`/api/register/invitation/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register via invitation');
    }
    return response.json();
  },

  // Send invitation (DJ only)
  async sendInvitation(data: SendInvitationRequest): Promise<InvitationResponse> {
    return apiClient.post('/invitations', data);
  },

  // Get DJ invitations
  async getDjInvitations(): Promise<{ data: Invitation[] }> {
    return apiClient.get('/invitations');
  },

  // Get client invitations
  async getClientInvitations(): Promise<{ data: Invitation[] }> {
    return apiClient.get('/client/invitations');
  },

  // Cancel invitation
  async cancelInvitation(invitationId: number): Promise<{ message: string }> {
    return apiClient.delete(`/invitations/${invitationId}`);
  },

  // Resend invitation
  async resendInvitation(invitationId: number): Promise<InvitationResponse> {
    return apiClient.post(`/invitations/${invitationId}/resend`);
  },

  // Get invitation statistics (Admin only)
  async getInvitationStats(): Promise<InvitationStats> {
    return apiClient.get('/admin/invitations/stats');
  },
};
