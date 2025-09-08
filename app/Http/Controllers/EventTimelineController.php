<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventTimeline;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventTimelineController extends Controller
{
    /**
     * Get timeline data for an event
     */
    public function show(Event $event): JsonResponse
    {
        \Log::info('=== TIMELINE SHOW DEBUG ===');
        \Log::info('Timeline show method called', [
            'event_id' => $event->id,
            'event_name' => $event->name,
            'user_authenticated' => auth()->check(),
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role,
            'user_email' => auth()->user()?->email
        ]);

        $timeline = $event->timeline;

        \Log::info('Timeline data', [
            'event_id' => $event->id,
            'has_timeline' => $timeline ? 'Yes' : 'No',
            'timeline_id' => $timeline?->id
        ]);

        if (!$timeline) {
            \Log::info('No timeline found for event', ['event_id' => $event->id]);
            return response()->json([
                'message' => 'No timeline data found for this event',
                'timeline_data' => null
            ], 200);
        }

        \Log::info('Timeline found', [
            'event_id' => $event->id,
            'timeline_items_count' => count($timeline->timeline_data['timeline_items'] ?? [])
        ]);
        \Log::info('=== END TIMELINE SHOW DEBUG ===');

        return response()->json([
            'message' => 'Timeline data retrieved successfully',
            'timeline_data' => $timeline->timeline_data
        ]);
    }

    /**
     * Save or update timeline data for an event
     */
    public function store(Request $request, Event $event): JsonResponse
    {
        try {
            $timelineData = $request->only(['timeline_items']);

            // Create or update timeline record
            $timeline = $event->timeline;
            if ($timeline) {
                $timeline->update(['timeline_data' => $timelineData]);
            } else {
                $timeline = EventTimeline::create([
                    'event_id' => $event->id,
                    'timeline_data' => $timelineData
                ]);
            }

            return response()->json([
                'message' => 'Timeline saved successfully',
                'timeline_data' => $timeline->timeline_data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error saving timeline data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update timeline data for an event
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        try {
            \Log::info('=== TIMELINE UPDATE DEBUG ===');
            \Log::info('Timeline update method called', [
                'event_id' => $event->id,
                'event_name' => $event->name,
                'user_authenticated' => auth()->check(),
                'user_id' => auth()->id(),
                'user_role' => auth()->user()?->role,
                'user_email' => auth()->user()?->email,
                'request_data' => $request->all()
            ]);

            $timelineData = $request->only(['timeline_items']);

            \Log::info('Timeline data to update', [
                'event_id' => $event->id,
                'timeline_items_count' => count($timelineData['timeline_items'] ?? [])
            ]);

            // Create or update timeline record
            $timeline = $event->timeline;
            if ($timeline) {
                $timeline->update(['timeline_data' => $timelineData]);
                \Log::info('Timeline updated', [
                    'timeline_id' => $timeline->id,
                    'event_id' => $event->id
                ]);
            } else {
                $timeline = EventTimeline::create([
                    'event_id' => $event->id,
                    'timeline_data' => $timelineData
                ]);
                \Log::info('Timeline created', [
                    'timeline_id' => $timeline->id,
                    'event_id' => $event->id
                ]);
            }

            \Log::info('=== END TIMELINE UPDATE DEBUG ===');

            return response()->json([
                'message' => 'Timeline updated successfully',
                'timeline_data' => $timeline->timeline_data
            ]);

        } catch (\Exception $e) {
            \Log::error('Error updating timeline', [
                'event_id' => $event->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error updating timeline data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
