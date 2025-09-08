<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class InvitationController extends Controller
{
    /**
     * Send an invitation to a client for an event
     */
    public function sendInvitation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:events,id',
            'client_email' => 'required|email',
            'client_name' => 'nullable|string|max:255',
            'expires_in_days' => 'nullable|integer|min:1|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        
        // Check if user is DJ and owns the event
        if (!$user->isDj()) {
            return response()->json(['message' => 'Only DJs can send invitations'], 403);
        }

        $event = Event::where('id', $request->event_id)
                     ->where('dj_id', $user->id)
                     ->first();

        if (!$event) {
            return response()->json(['message' => 'Event not found or access denied'], 404);
        }

        // Check if invitation already exists
        $existingInvitation = Invitation::where('event_id', $request->event_id)
                                      ->where('client_email', $request->client_email)
                                      ->where('status', 'pending')
                                      ->first();

        if ($existingInvitation) {
            return response()->json(['message' => 'Invitation already sent to this email'], 409);
        }

        // Create invitation
        $expiresInDays = $request->expires_in_days ?? 7;
        $invitation = Invitation::create([
            'event_id' => $request->event_id,
            'dj_id' => $user->id,
            'client_email' => $request->client_email,
            'client_name' => $request->client_name,
            'expires_at' => Carbon::now()->addDays($expiresInDays),
        ]);

        // TODO: Send email notification
        // Mail::to($request->client_email)->send(new EventInvitationMail($invitation));

        return response()->json([
            'message' => 'Invitation sent successfully',
            'invitation' => $invitation->load(['event', 'dj'])
        ], 201);
    }

    /**
     * Get invitation by ID (for client acceptance)
     */
    public function getInvitationById(int $id): JsonResponse
    {
        \Log::info('🔍 [InvitationController] Getting invitation by ID: ' . $id);
        
        $invitation = Invitation::with(['event', 'dj'])
                               ->where('id', $id)
                               ->first();

        if (!$invitation) {
            \Log::warning('❌ [InvitationController] Invitation not found for ID: ' . $id);
            return response()->json(['message' => 'Invitation not found'], 404);
        }

        \Log::info('✅ [InvitationController] Found invitation:', [
            'id' => $invitation->id,
            'status' => $invitation->status,
            'client_email' => $invitation->client_email,
            'expires_at' => $invitation->expires_at,
            'event_name' => $invitation->event->name ?? 'N/A'
        ]);

        if ($invitation->isExpired()) {
            \Log::info('⚠️ [InvitationController] Invitation expired, marking as expired');
            $invitation->markAsExpired();
            return response()->json(['message' => 'Invitation has expired'], 410);
        }

        return response()->json([
            'invitation' => $invitation
        ]);
    }

    /**
     * Accept an invitation
     */
    public function acceptInvitation(Request $request, int $id): JsonResponse
    {
        \Log::info('🔍 [InvitationController] Accepting invitation with ID: ' . $id);
        
        $invitation = Invitation::where('id', $id)->first();

        if (!$invitation) {
            \Log::warning('❌ [InvitationController] Invitation not found for ID: ' . $id);
            return response()->json(['message' => 'Invitation not found'], 404);
        }

        \Log::info('✅ [InvitationController] Found invitation for acceptance:', [
            'id' => $invitation->id,
            'status' => $invitation->status,
            'client_email' => $invitation->client_email,
            'expires_at' => $invitation->expires_at
        ]);

        // Check if invitation is already accepted
        if ($invitation->isAccepted()) {
            \Log::info('⚠️ [InvitationController] Invitation already accepted');
            return response()->json(['message' => 'Invitation already accepted'], 409);
        }

        // Check if invitation is expired
        if ($invitation->isExpired()) {
            \Log::info('⚠️ [InvitationController] Invitation expired, marking as expired');
            $invitation->markAsExpired();
            return response()->json(['message' => 'Invitation has expired'], 410);
        }

        $user = auth()->user();
        
        // Check if user is logged in
        if (!$user) {
            \Log::warning('❌ [InvitationController] No authenticated user');
            return response()->json(['message' => 'Authentication required'], 401);
        }

        \Log::info('👤 [InvitationController] Authenticated user:', [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role
        ]);

        // Check if user email matches invitation email
        if ($user->email !== $invitation->client_email) {
            \Log::warning('❌ [InvitationController] Email mismatch:', [
                'user_email' => $user->email,
                'invitation_email' => $invitation->client_email
            ]);
            return response()->json([
                'message' => 'Email mismatch. This invitation is for ' . $invitation->client_email . ', but you are logged in as ' . $user->email
            ], 403);
        }

        // Mark invitation as accepted
        \Log::info('✅ [InvitationController] Email match confirmed, accepting invitation');
        $invitation->markAsAccepted();

        \Log::info('🎉 [InvitationController] Invitation accepted successfully:', [
            'invitation_id' => $invitation->id,
            'accepted_at' => $invitation->accepted_at
        ]);

        return response()->json([
            'message' => 'Invitation accepted successfully',
            'invitation' => $invitation->load(['event', 'dj'])
        ]);
    }

    /**
     * Get all invitations for a DJ
     */
    public function getDjInvitations(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user->isDj()) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $invitations = Invitation::with(['event', 'client'])
                                ->where('dj_id', $user->id)
                                ->orderBy('created_at', 'desc')
                                ->paginate(15);

        return response()->json($invitations);
    }

    /**
     * Get all invitations for a client
     */
    public function getClientInvitations(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user->isClient()) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $invitations = Invitation::with(['event', 'dj'])
                                ->where('client_email', $user->email)
                                ->orderBy('created_at', 'desc')
                                ->paginate(15);

        return response()->json($invitations);
    }

    /**
     * Cancel an invitation
     */
    public function cancelInvitation(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user->isDj()) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $invitation = Invitation::where('id', $id)
                               ->where('dj_id', $user->id)
                               ->first();

        if (!$invitation) {
            return response()->json(['message' => 'Invitation not found'], 404);
        }

        if ($invitation->isAccepted()) {
            return response()->json(['message' => 'Cannot cancel accepted invitation'], 409);
        }

        $invitation->update(['status' => 'expired']);

        return response()->json(['message' => 'Invitation cancelled successfully']);
    }

    /**
     * Resend an invitation
     */
    public function resendInvitation(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user->isDj()) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $invitation = Invitation::where('id', $id)
                               ->where('dj_id', $user->id)
                               ->first();

        if (!$invitation) {
            return response()->json(['message' => 'Invitation not found'], 404);
        }

        if ($invitation->isAccepted()) {
            return response()->json(['message' => 'Cannot resend accepted invitation'], 409);
        }

        try {
            // Update expiry date to 7 days from now
            $invitation->update([
                'expires_at' => Carbon::now()->addDays(7),
                'status' => 'pending' // Reset status to pending
            ]);

            // Send invitation email
            Mail::to($invitation->client_email)->send(new \App\Mail\EventInvitationMail($invitation));

            return response()->json([
                'message' => 'Invitation resent successfully',
                'invitation' => $invitation->load(['event', 'dj'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to resend invitation email', [
                'invitation_id' => $invitation->id,
                'client_email' => $invitation->client_email,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to resend invitation email',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get invitation statistics for admin
     */
    public function getInvitationStats(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        $stats = [
            'total_invitations' => Invitation::count(),
            'pending_invitations' => Invitation::pending()->count(),
            'accepted_invitations' => Invitation::accepted()->count(),
            'expired_invitations' => Invitation::expired()->count(),
        ];

        return response()->json($stats);
    }
}