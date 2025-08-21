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
            $user = $request->user();

            // Validation rules matching the frontend Zod schema
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'event_date' => 'required|date|after_or_equal:today',
                'setup_time' => 'required|date_format:H:i',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after_or_equal:start_time',
                'service_package' => 'required|string|max:255',
                'service_description' => 'nullable|string',
                'guest_count' => 'required|integer|min:1',
                
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
                'client_city' => 'required|string|max:100',
                'client_state' => 'required|string|max:2',
                'client_zipcode' => 'required|string|max:10',
                
                // Custom client fields
                'partner_name' => 'nullable|string|max:255',
                'partner_email' => 'nullable|email|max:255',
                'mob_fog' => 'nullable|string|max:255',
                'mob_fog_email' => 'nullable|email|max:255',
                'other_contact' => 'nullable|string|max:255',
                'poc_email_phone' => 'nullable|string|max:255',
                'vibo_link' => 'nullable|url|max:255',
                
                // Financial fields
                'package' => 'required|numeric|min:0',
                'add_ons' => 'nullable|array',
                'add_ons.*.name' => 'required_with:add_ons|string|max:255',
                'add_ons.*.price' => 'required_with:add_ons|numeric|min:0',
                'add_ons.*.quantity' => 'required_with:add_ons|integer|min:1',
                'deposit_value' => 'nullable|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();
            
            // Add the authenticated user's ID as the DJ
            $validatedData['dj_id'] = $user->id;

            // Convert time strings to full datetime for the event date
            $eventDate = $validatedData['event_date'];
            $validatedData['setup_time'] = $eventDate . ' ' . $validatedData['setup_time'] . ':00';
            $validatedData['start_time'] = $eventDate . ' ' . $validatedData['start_time'] . ':00';
            $validatedData['end_time'] = $eventDate . ' ' . $validatedData['end_time'] . ':00';

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
            $user = $request->user();

            // Ensure the event belongs to the authenticated user
            if ($event->dj_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this event.'
                ], 403);
            }

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
            $user = $request->user();

            // Ensure the event belongs to the authenticated user
            if ($event->dj_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this event.'
                ], 403);
            }

            // Validation rules
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'event_date' => 'sometimes|required|date|after_or_equal:today',
                'setup_time' => 'sometimes|required|date_format:H:i',
                'start_time' => 'sometimes|required|date_format:H:i',
                'end_time' => 'sometimes|required|date_format:H:i|after_or_equal:start_time',
                'service_package' => 'sometimes|required|string|max:255',
                'service_description' => 'nullable|string',
                'guest_count' => 'sometimes|required|integer|min:1',
                'venue_name' => 'sometimes|nullable|string|max:255',
                'venue_address' => 'sometimes|nullable|string|max:255',
                'venue_city' => 'sometimes|nullable|string|max:100',
                'venue_state' => 'sometimes|nullable|string|max:2',
                'venue_zipcode' => 'sometimes|nullable|string|max:10',
                'venue_phone' => 'nullable|string|max:20',
                'venue_email' => 'nullable|email|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();

            // Convert time strings to full datetime if provided
            if (isset($validatedData['event_date'])) {
                $eventDate = $validatedData['event_date'];
                if (isset($validatedData['setup_time'])) {
                    $validatedData['setup_time'] = $eventDate . ' ' . $validatedData['setup_time'] . ':00';
                }
                if (isset($validatedData['start_time'])) {
                    $validatedData['start_time'] = $eventDate . ' ' . $validatedData['start_time'] . ':00';
                }
                if (isset($validatedData['end_time'])) {
                    $validatedData['end_time'] = $eventDate . ' ' . $validatedData['end_time'] . ':00';
                }
            }

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
            $user = $request->user();

            // Ensure the event belongs to the authenticated user
            if ($event->dj_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this event.'
                ], 403);
            }

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
