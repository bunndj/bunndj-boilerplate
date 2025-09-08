<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventMusicIdeas;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class EventMusicIdeasController extends Controller
{
    /**
     * Get music ideas for an event
     */
    public function show(Event $event): JsonResponse
    {
        \Log::info('=== MUSIC IDEAS SHOW DEBUG ===');
        \Log::info('Music ideas show method called', [
            'event_id' => $event->id,
            'event_name' => $event->name,
            'user_authenticated' => auth()->check(),
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role,
            'user_email' => auth()->user()?->email
        ]);

        $musicIdeas = $event->musicIdeas;
        
        \Log::info('Music ideas data', [
            'event_id' => $event->id,
            'has_music_ideas' => $musicIdeas ? 'Yes' : 'No',
            'music_ideas_id' => $musicIdeas?->id
        ]);
        
        if (!$musicIdeas) {
            \Log::info('No music ideas found for event', ['event_id' => $event->id]);
            return response()->json([
                'music_ideas' => null,
                'notes' => null,
                'total_songs' => 0
            ]);
        }

        \Log::info('Music ideas found', [
            'event_id' => $event->id,
            'total_songs' => $musicIdeas->getTotalSongCount(),
            'has_notes' => $musicIdeas->notes ? 'Yes' : 'No'
        ]);
        \Log::info('=== END MUSIC IDEAS SHOW DEBUG ===');

        return response()->json([
            'music_ideas' => $musicIdeas->music_ideas,
            'notes' => $musicIdeas->notes,
            'total_songs' => $musicIdeas->getTotalSongCount()
        ]);
    }

    /**
     * Store or update music ideas for an event
     */
    public function store(Request $request, Event $event): JsonResponse
    {
        try {
            $validated = $request->validate([
                'music_ideas' => 'nullable|array',
                'music_ideas.must_play' => 'nullable|array|max:60',
                'music_ideas.play_if_possible' => 'nullable|array|max:30', 
                'music_ideas.dedication' => 'nullable|array|max:10',
                'music_ideas.play_only_if_requested' => 'nullable|array|max:5',
                'music_ideas.do_not_play' => 'nullable|array|max:10',
                'music_ideas.guest_request' => 'nullable|array',
                'music_ideas.must_play.*.song_title' => 'required_with:music_ideas.must_play.*|string|max:255',
                'music_ideas.must_play.*.artist' => 'nullable|string|max:255',
                'music_ideas.must_play.*.client_visible_title' => 'nullable|string|max:255',
                'music_ideas.play_if_possible.*.song_title' => 'required_with:music_ideas.play_if_possible.*|string|max:255',
                'music_ideas.play_if_possible.*.artist' => 'nullable|string|max:255',
                'music_ideas.play_if_possible.*.client_visible_title' => 'nullable|string|max:255',
                'music_ideas.dedication.*.song_title' => 'required_with:music_ideas.dedication.*|string|max:255',
                'music_ideas.dedication.*.artist' => 'nullable|string|max:255',
                'music_ideas.dedication.*.client_visible_title' => 'nullable|string|max:255',
                'music_ideas.play_only_if_requested.*.song_title' => 'required_with:music_ideas.play_only_if_requested.*|string|max:255',
                'music_ideas.play_only_if_requested.*.artist' => 'nullable|string|max:255',
                'music_ideas.play_only_if_requested.*.client_visible_title' => 'nullable|string|max:255',
                'music_ideas.do_not_play.*.song_title' => 'required_with:music_ideas.do_not_play.*|string|max:255',
                'music_ideas.do_not_play.*.artist' => 'nullable|string|max:255',
                'music_ideas.do_not_play.*.client_visible_title' => 'nullable|string|max:255',
                'music_ideas.guest_request.*.song_title' => 'required_with:music_ideas.guest_request.*|string|max:255',
                'music_ideas.guest_request.*.artist' => 'nullable|string|max:255',
                'music_ideas.guest_request.*.client_visible_title' => 'nullable|string|max:255',
                'notes' => 'nullable|string'
            ]);

            $musicIdeas = EventMusicIdeas::updateOrCreate(
                ['event_id' => $event->id],
                [
                    'music_ideas' => $validated['music_ideas'],
                    'notes' => $validated['notes'] ?? null
                ]
            );

            return response()->json([
                'message' => 'Music ideas saved successfully',
                'music_ideas' => $musicIdeas->music_ideas,
                'notes' => $musicIdeas->notes,
                'total_songs' => $musicIdeas->getTotalSongCount()
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to save music ideas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update music ideas for an event
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        return $this->store($request, $event);
    }
}
