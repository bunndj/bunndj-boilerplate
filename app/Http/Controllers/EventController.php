<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Invitation;
use App\Mail\EventInvitationMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class EventController extends Controller
{
    /**
     * Get validation rules for event data.
     */
    private function getValidationRules(bool $isUpdate = false): array
    {
        $requiredRule = $isUpdate ? 'required' : 'required';
        
        return [
            'name' => "{$requiredRule}|string|max:255",
            'event_date' => "{$requiredRule}|date|after_or_equal:today",
            'setup_time' => "{$requiredRule}|date_format:H:i",
            'start_time' => "{$requiredRule}|date_format:H:i",
            'end_time' => "{$requiredRule}|date_format:H:i|after_or_equal:start_time",
            'service_package' => "{$requiredRule}|string|max:255",
            'service_description' => 'nullable|string',
            'guest_count' => "{$requiredRule}|integer|min:1",
            
            // Venue fields
            'venue_name' => 'nullable|string|max:255',
            'venue_address' => 'nullable|string|max:255',
            'venue_city' => 'nullable|string|max:100',
            'venue_state' => 'nullable|string|max:2',
            'venue_zipcode' => 'nullable|string|max:10',
            'venue_phone' => 'nullable|string|max:20',
            'venue_email' => 'nullable|email|max:255',
            
            // Client information fields
            'client_firstname' => 'nullable|string|max:255',
            'client_lastname' => 'nullable|string|max:255',
            'client_organization' => 'nullable|string|max:255',
            'client_cell_phone' => 'nullable|string|max:20',
            'client_home_phone' => 'nullable|string|max:20',
            'client_email' => 'nullable|email|max:255',
            'client_address' => 'nullable|string|max:255',
            'client_address_line2' => 'nullable|string|max:255',
            'client_city' => "{$requiredRule}|string|max:100",
            'client_state' => "{$requiredRule}|string|max:2",
            'client_zipcode' => "{$requiredRule}|string|max:10",
            
            // Custom client fields
            'partner_name' => 'nullable|string|max:255',
            'partner_email' => 'nullable|email|max:255',
            'mob_fog' => 'nullable|string|max:255',
            'mob_fog_email' => 'nullable|email|max:255',
            'other_contact' => 'nullable|string|max:255',
            'poc_email_phone' => 'nullable|string|max:255',
            'vibo_link' => 'nullable|url|max:255',
            
            // Financial fields
            'package' => "{$requiredRule}|numeric|min:0",
            'add_ons' => 'nullable|array',
            'add_ons.*.name' => 'required_with:add_ons|string|max:255',
            'add_ons.*.price' => 'required_with:add_ons|numeric|min:0',
            'add_ons.*.quantity' => 'required_with:add_ons|integer|min:1',
            'deposit_value' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Validate and prepare event data.
     */
    private function validateAndPrepareEventData(Request $request, bool $isUpdate = false): array
    {
        $validator = Validator::make($request->all(), $this->getValidationRules($isUpdate));

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $validatedData = $validator->validated();

        // Convert time strings to full datetime for the event date
        $eventDate = $validatedData['event_date'];
        $validatedData['setup_time'] = $eventDate . ' ' . $validatedData['setup_time'] . ':00';
        $validatedData['start_time'] = $eventDate . ' ' . $validatedData['start_time'] . ':00';
        $validatedData['end_time'] = $eventDate . ' ' . $validatedData['end_time'] . ':00';

        return $validatedData;
    }

    /**
     * Check if user owns the event or is an admin.
     */
    private function authorizeEventAccess(Event $event, $userId): void
    {
        $user = auth()->user();
        
        // Allow access if user is an admin or owns the event
        if ($user && ($user->role === 'admin' || $event->dj_id === $userId)) {
            return;
        }
        
        abort(403, 'Unauthorized access to this event.');
    }
    /**
     * Display a listing of events for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Get events for the authenticated user (assuming dj_id corresponds to user_id)
            $events = Event::where('dj_id', $user->id)
                          ->with(['invitations'])
                          ->orderBy('event_date', 'desc')
                          ->get();

            return response()->json([
                'success' => true,
                'data' => $events
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch events.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $this->validateAndPrepareEventData($request);
            
            // Add the authenticated user's ID as the DJ
            $validatedData['dj_id'] = $request->user()->id;

            // Create the event
            $event = Event::create($validatedData);

            // Create invitation if client email is provided (but don't send email)
            $invitation = null;
            if (!empty($validatedData['client_email'])) {
                try {
                    // Create invitation
                    $invitation = Invitation::create([
                        'event_id' => $event->id,
                        'dj_id' => $request->user()->id,
                        'client_email' => $validatedData['client_email'],
                        'client_name' => $validatedData['client_firstname'] . ' ' . $validatedData['client_lastname'],
                        'expires_at' => Carbon::now()->addDays(7), // 7 days expiry
                    ]);

                    // NOTE: Email sending removed - will be triggered manually via send button

                } catch (\Exception $emailException) {
                    // Log error but don't fail the event creation
                    \Log::error('Failed to create invitation', [
                        'event_id' => $event->id,
                        'client_email' => $validatedData['client_email'],
                        'error' => $emailException->getMessage()
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Event created successfully' . ($invitation ? ' and invitation created (ready to send).' : '.'),
                'data' => $event->load(['invitations']),
                'invitation' => $invitation
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create event.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified event.
     */
    public function show(Request $request, Event $event): JsonResponse
    {
        try {
            \Log::info('Event show method called', [
                'event_id' => $event->id,
                'event_name' => $event->name,
                'user_authenticated' => auth()->check(),
                'user_id' => auth()->id(),
                'user_role' => auth()->user()?->role
            ]);

            $user = $request->user();
            
            if (!$user) {
                \Log::error('No authenticated user found');
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            
            // Check authorization based on user role
            if ($user->role === 'admin') {
                // Admins can view any event
                \Log::info('Loading event for admin', ['event_id' => $event->id]);
                $event->load(['dj', 'invitations.client']);
            } elseif ($user->role === 'dj') {
                // DJs can only view their own events
                \Log::info('Loading event for DJ', ['event_id' => $event->id, 'dj_id' => $user->id]);
                $this->authorizeEventAccess($event, $user->id);
                
                // Check if event date is in the past and prevent access
                if ($event->event_date < now()->toDateString()) {
                    \Log::warning('DJ trying to access past event', [
                        'event_id' => $event->id,
                        'event_date' => $event->event_date,
                        'current_date' => now()->toDateString(),
                        'dj_id' => $user->id
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'This event has already passed and cannot be accessed.',
                        'is_past_event' => true
                    ], 403);
                }
            } elseif ($user->role === 'client') {
                // Clients can only view events they're invited to and that are not past
                \Log::info('Loading event for client', ['event_id' => $event->id, 'client_email' => $user->email]);
                
                // Check if event date is in the past
                if ($event->event_date < now()->toDateString()) {
                    \Log::warning('Client trying to access past event', [
                        'event_id' => $event->id,
                        'event_date' => $event->event_date,
                        'current_date' => now()->toDateString()
                    ]);
                    return response()->json(['message' => 'Event not found or access denied'], 404);
                }
                
                // Use the same logic as invitedEvents relationship
                $invitation = \App\Models\Invitation::where('event_id', $event->id)
                                                  ->where('client_email', $user->email)
                                                  ->where('status', 'accepted')
                                                  ->first();
                
                if (!$invitation) {
                    \Log::warning('Client not invited to event or invitation not accepted', [
                        'event_id' => $event->id, 
                        'client_email' => $user->email,
                        'available_invitations' => \App\Models\Invitation::where('event_id', $event->id)
                                                                        ->where('client_email', $user->email)
                                                                        ->get(['id', 'status', 'client_email'])
                    ]);
                    return response()->json(['message' => 'Event not found or access denied'], 404);
                }
                
                $event->load(['dj', 'planning', 'musicIdeas', 'timeline']);
            } else {
                \Log::warning('Invalid user role', ['user_role' => $user->role]);
                return response()->json(['message' => 'Access denied'], 403);
            }

            \Log::info('Event loaded successfully', ['event_id' => $event->id]);

            return response()->json([
                'success' => true,
                'data' => $event
            ]);
        } catch (\Exception $e) {
            \Log::error('Event show method error', [
                'event_id' => $event->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch event.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        try {
            $this->authorizeEventAccess($event, $request->user()->id);
            
            $validatedData = $this->validateAndPrepareEventData($request, true);

            // Check if client email has changed
            $oldClientEmail = $event->client_email;
            $newClientEmail = $validatedData['client_email'] ?? null;
            $emailChanged = $oldClientEmail !== $newClientEmail;

            // Update the event
            $event->update($validatedData);

            $invitation = null;
            $invitationMessage = '';

            // Handle invitation logic if client email changed
            if ($emailChanged) {
                try {
                    // Find existing invitation by dj_id and event_id
                    $invitation = Invitation::where('event_id', $event->id)
                        ->where('dj_id', $request->user()->id)
                        ->first();

                    if (!empty($newClientEmail)) {
                        $invitationData = [
                            'client_email' => $newClientEmail,
                            'client_name' => ($validatedData['client_firstname'] ?? '') . ' ' . ($validatedData['client_lastname'] ?? ''),
                            'expires_at' => Carbon::now()->addDays(7), // Reset expiry to 7 days
                            'status' => 'pending', // Reset status to pending
                            'updated_at' => Carbon::now(),
                        ];

                        if ($invitation) {
                            // Update existing invitation
                            $invitation->update($invitationData);
                            $invitationMessage = ' and invitation updated for new client email';
                        } else {
                            // Create new invitation if none exists
                            $invitationData['event_id'] = $event->id;
                            $invitationData['dj_id'] = $request->user()->id;
                            $invitation = Invitation::create($invitationData);
                            $invitationMessage = ' and new invitation created for client email';
                        }

                        // NOTE: Email sending removed - will be triggered manually via send button
                        $invitationMessage .= ' (invitation ready to send)';
                    } else {
                        // If email is removed, mark invitation as cancelled
                        if ($invitation) {
                            $invitation->update(['status' => 'cancelled']);
                            $invitationMessage = ' and invitation cancelled';
                        } else {
                            $invitationMessage = ' and client email removed';
                        }
                    }

                } catch (\Exception $emailException) {
                    // Log email error but don't fail the event update
                    \Log::error('Failed to send invitation email during event update', [
                        'event_id' => $event->id,
                        'old_email' => $oldClientEmail,
                        'new_email' => $newClientEmail,
                        'error' => $emailException->getMessage()
                    ]);
                    $invitationMessage = ' but failed to send invitation email';
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Event updated successfully' . $invitationMessage . '.',
                'data' => $event->fresh(['invitations']),
                'invitation' => $invitation,
                'email_changed' => $emailChanged
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Request $request, Event $event): JsonResponse
    {
        try {
            $this->authorizeEventAccess($event, $request->user()->id);

            $event->delete();

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get events for a client (only invited events that are not past)
     */
    public function getClientEvents(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user->isClient()) {
                return response()->json(['message' => 'Access denied'], 403);
            }

            // Only show events that are today or in the future
            $events = $user->invitedEvents()
                          ->with(['dj', 'planning', 'musicIdeas', 'timeline'])
                          ->whereDate('event_date', '>=', now()->toDateString())
                          ->orderBy('event_date', 'asc')
                          ->get();

            return response()->json([
                'success' => true,
                'data' => $events
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch client events.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all events for admin (with DJ and client information)
     */
    public function getAdminEvents(Request $request): JsonResponse
    {
        try {
            $query = Event::with(['dj', 'invitations.client']);

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('client_firstname', 'like', "%{$search}%")
                      ->orWhere('client_lastname', 'like', "%{$search}%")
                      ->orWhere('client_email', 'like', "%{$search}%")
                      ->orWhere('venue_name', 'like', "%{$search}%");
                });
            }

            // Status filter
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // DJ filter
            if ($request->has('dj') && $request->dj !== 'all') {
                $query->where('dj_id', $request->dj);
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $events = $query->orderBy('event_date', 'desc')->paginate($perPage);

            // Transform the data to include client information from invitations
            $transformedEvents = $events->getCollection()->map(function ($event) {
                $client = $event->invitations->first()?->client;
                
                // Format the event date properly
                $eventDate = $event->event_date ? Carbon::parse($event->event_date)->format('Y-m-d') : null;
                
                // Format start and end times properly
                $startTime = $event->start_time ? Carbon::parse($event->start_time)->format('H:i') : null;
                $endTime = $event->end_time ? Carbon::parse($event->end_time)->format('H:i') : null;
                
                // Get package value - try both package and service_package fields
                $packageValue = $event->package ?? $event->service_package;
                // Convert to number if it's a numeric string
                $packageNumeric = is_numeric($packageValue) ? (float)$packageValue : 0;
                
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'event_date' => $eventDate,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'venue_name' => $event->venue_name,
                    'venue_city' => $event->venue_city,
                    'venue_state' => $event->venue_state,
                    'guest_count' => $event->guest_count,
                    'dj' => [
                        'id' => $event->dj->id,
                        'name' => $event->dj->name,
                        'organization' => $event->dj->organization,
                    ],
                    'client_firstname' => $client?->name ? explode(' ', $client->name)[0] : $event->client_firstname,
                    'client_lastname' => $client?->name ? explode(' ', $client->name, 2)[1] ?? '' : $event->client_lastname,
                    'client_email' => $client?->email ?? $event->client_email,
                    'package' => $packageNumeric,
                    'status' => $event->status ?? 'upcoming',
                    'created_at' => $event->created_at,
                ];
            });

            // Debug logging
            \Log::info('Admin Events API called', [
                'total_events' => $events->total(),
                'current_page' => $events->currentPage(),
                'events_count' => $events->count(),
                'first_event' => $transformedEvents->first()
            ]);

            return response()->json([
                'data' => $transformedEvents,
                'pagination' => [
                    'current_page' => $events->currentPage(),
                    'last_page' => $events->lastPage(),
                    'per_page' => $events->perPage(),
                    'total' => $events->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch admin events.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific event for a client (only if invited)
     */
    public function getClientEvent(Request $request, Event $event): JsonResponse
    {
        try {
            \Log::info('=== CLIENT EVENT ACCESS DEBUG ===');
            \Log::info('getClientEvent method called', [
                'event_id' => $event->id,
                'event_name' => $event->name,
                'event_client_email' => $event->client_email,
                'user_authenticated' => auth()->check(),
                'user_id' => auth()->id(),
                'user_role' => auth()->user()?->role,
                'user_email' => auth()->user()?->email
            ]);

            $user = $request->user();
            
            if (!$user) {
                \Log::error('No authenticated user found in getClientEvent');
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            
            \Log::info('User details in getClientEvent', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'is_client' => $user->isClient()
            ]);
            
            if (!$user->isClient()) {
                \Log::warning('User is not a client', [
                    'user_role' => $user->role,
                    'is_client_method' => $user->isClient()
                ]);
                return response()->json(['message' => 'Access denied'], 403);
            }

            // Check if event date is in the past
            if ($event->event_date < now()->toDateString()) {
                \Log::warning('Client trying to access past event', [
                    'event_id' => $event->id,
                    'event_date' => $event->event_date,
                    'current_date' => now()->toDateString()
                ]);
                return response()->json(['message' => 'Event not found or access denied'], 404);
            }

            // Check all invitations for this event and client first
            $allInvitations = \App\Models\Invitation::where('event_id', $event->id)
                                                  ->where('client_email', $user->email)
                                                  ->get(['id', 'status', 'client_email', 'expires_at']);
            
            \Log::info('All invitations for this client and event', [
                'event_id' => $event->id,
                'client_email' => $user->email,
                'invitations' => $allInvitations->toArray(),
                'invitation_count' => $allInvitations->count()
            ]);

            // Check if client is invited to this event
            $invitation = \App\Models\Invitation::where('event_id', $event->id)
                                              ->where('client_email', $user->email)
                                              ->where('status', 'accepted')
                                              ->first();

            if (!$invitation) {
                \Log::warning('Client not invited to event or invitation not accepted', [
                    'event_id' => $event->id,
                    'client_email' => $user->email,
                    'available_invitations' => $allInvitations->toArray(),
                    'accepted_invitation_found' => false
                ]);
                return response()->json(['message' => 'Event not found or access denied'], 404);
            }

            \Log::info('Invitation found and accepted', [
                'invitation_id' => $invitation->id,
                'invitation_status' => $invitation->status,
                'invitation_client_email' => $invitation->client_email
            ]);

            $event->load(['dj', 'planning', 'musicIdeas', 'timeline']);

            \Log::info('Event loaded successfully for client', [
                'event_id' => $event->id,
                'event_name' => $event->name,
                'has_planning' => $event->planning ? 'Yes' : 'No',
                'has_music_ideas' => $event->musicIdeas ? 'Yes' : 'No',
                'has_timeline' => $event->timeline ? 'Yes' : 'No'
            ]);
            \Log::info('=== END CLIENT EVENT ACCESS DEBUG ===');

            return response()->json([
                'success' => true,
                'data' => $event
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getClientEvent', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'event_id' => $event->id ?? 'unknown'
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch event.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send invitation email for an event.
     */
    public function sendInvitation(Request $request, Event $event): JsonResponse
    {
        try {
            $this->authorizeEventAccess($event, $request->user()->id);

            // Check if event has client email
            if (empty($event->client_email)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event does not have a client email address.'
                ], 400);
            }

            // Find or create invitation
            $invitation = Invitation::where('event_id', $event->id)
                ->where('dj_id', $request->user()->id)
                ->first();

            if (!$invitation) {
                // Create new invitation
                $invitation = Invitation::create([
                    'event_id' => $event->id,
                    'dj_id' => $request->user()->id,
                    'client_email' => $event->client_email,
                    'client_name' => ($event->client_firstname ?? '') . ' ' . ($event->client_lastname ?? ''),
                    'expires_at' => Carbon::now()->addDays(7),
                ]);
            } else {
                // Update existing invitation
                $invitation->update([
                    'client_email' => $event->client_email,
                    'client_name' => ($event->client_firstname ?? '') . ' ' . ($event->client_lastname ?? ''),
                    'expires_at' => Carbon::now()->addDays(7), // Reset expiry
                    'status' => 'pending', // Reset status
                ]);
            }

            // Send invitation email
            Mail::to($event->client_email)->send(new EventInvitationMail($invitation));

            return response()->json([
                'success' => true,
                'message' => 'Invitation sent successfully.',
                'invitation' => $invitation->fresh(['event', 'dj'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to send invitation email', [
                'event_id' => $event->id,
                'client_email' => $event->client_email,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send invitation email.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
