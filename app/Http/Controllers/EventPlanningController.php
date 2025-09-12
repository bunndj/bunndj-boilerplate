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

        // Convert planning data to form format for client access
        $planningData = $planning->planning_data;
        $formData = [];
        
        if (is_array($planningData)) {
            foreach ($planningData as $field) {
                if (isset($field['field_name']) && isset($field['field_value'])) {
                    $formData[$field['field_name']] = $field['field_value'];
                }
            }
        }

        return response()->json([
            'planning_data' => $formData,
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

            // Convert form data to database format
            $planningDataArray = [];
            if (isset($validated['planning_data']) && is_array($validated['planning_data'])) {
                foreach ($validated['planning_data'] as $fieldName => $fieldValue) {
                    if ($fieldValue !== null && $fieldValue !== '') {
                        $planningDataArray[] = [
                            'field_name' => $fieldName,
                            'field_value' => $fieldValue
                        ];
                    }
                }
            }

            $planning = EventPlanning::updateOrCreate(
                ['event_id' => $event->id],
                [
                    'planning_data' => $planningDataArray,
                    'notes' => $validated['notes'] ?? null
                ]
            );

            // Convert back to form format for response
            $formData = [];
            foreach ($planningDataArray as $field) {
                $formData[$field['field_name']] = $field['field_value'];
            }

            return response()->json([
                'message' => 'Planning data saved successfully',
                'planning_data' => $formData,
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
