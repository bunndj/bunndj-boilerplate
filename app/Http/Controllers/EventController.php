<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

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
     * Check if user owns the event.
     */
    private function authorizeEventAccess(Event $event, $userId): void
    {
        if ($event->dj_id !== $userId) {
            abort(403, 'Unauthorized access to this event.');
        }
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

            return response()->json([
                'success' => true,
                'message' => 'Event created successfully.',
                'data' => $event
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
            $this->authorizeEventAccess($event, $request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $event
            ]);
        } catch (\Exception $e) {
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

            // Update the event
            $event->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Event updated successfully.',
                'data' => $event->fresh()
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
}
