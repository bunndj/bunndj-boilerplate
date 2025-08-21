<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the authenticated user
     */
    public function getStats(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Get total events count
            $totalEvents = Event::where('dj_id', $user->id)->count();
            
            // Get upcoming events count (events with date >= today)
            $upcomingEvents = Event::where('dj_id', $user->id)
                ->whereDate('event_date', '>=', Carbon::today())
                ->count();
            
            // Calculate profile completion percentage
            $profileCompletion = $this->calculateProfileCompletion($user);
            
            $stats = [
                'totalEvents' => $totalEvents,
                'upcomingEvents' => $upcomingEvents,
                'profileCompletion' => $profileCompletion,
            ];
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Calculate profile completion percentage
     */
    private function calculateProfileCompletion(User $user): int
    {
        $fields = [
            'name',
            'email',
            'username',
            'organization',
            'website',
            'home_phone',
            'cell_phone',
            'work_phone',
            'fax_phone',
            'address',
            'city',
            'state',
            'zipcode'
        ];
        
        $filledFields = 0;
        $totalFields = count($fields);
        
        foreach ($fields as $field) {
            if (!empty($user->$field)) {
                $filledFields++;
            }
        }
        
        return round(($filledFields / $totalFields) * 100);
    }
}
