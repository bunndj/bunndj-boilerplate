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
        $timeline = $event->timeline;

        if (!$timeline) {
            return response()->json([
                'message' => 'No timeline data found for this event',
                'timeline_data' => null
            ], 200);
        }

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
}
