<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventPlanning;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class EventPlanningController extends Controller
{
    /**
     * Get planning data for an event
     */
    public function show(Event $event): JsonResponse
    {
        $planning = $event->planning;
        
        if (!$planning) {
            return response()->json([
                'planning_data' => null,
                'notes' => null,
                'completion_percentage' => 0
            ]);
        }

        return response()->json([
            'planning_data' => $planning->planning_data,
            'notes' => $planning->notes,
            'completion_percentage' => $planning->getCompletionPercentage()
        ]);
    }

    /**
     * Store or update planning data for an event
     */
    public function store(Request $request, Event $event): JsonResponse
    {
        try {
            $validated = $request->validate([
                'planning_data' => 'nullable|array',
                'notes' => 'nullable|string'
            ]);

            $planning = EventPlanning::updateOrCreate(
                ['event_id' => $event->id],
                [
                    'planning_data' => $validated['planning_data'],
                    'notes' => $validated['notes'] ?? null
                ]
            );

            return response()->json([
                'message' => 'Planning data saved successfully',
                'planning_data' => $planning->planning_data,
                'notes' => $planning->notes,
                'completion_percentage' => $planning->getCompletionPercentage()
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to save planning data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update planning data for an event
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        return $this->store($request, $event);
    }
}
