<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventMusicIdeas extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'event_id',
        'music_ideas',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'music_ideas' => 'array',
        ];
    }

    /**
     * Get the event that owns this music ideas
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get must play songs
     */
    public function getMustPlaySongs(): array
    {
        return $this->music_ideas['must_play'] ?? [];
    }

    /**
     * Get play if possible songs
     */
    public function getPlayIfPossibleSongs(): array
    {
        return $this->music_ideas['play_if_possible'] ?? [];
    }

    /**
     * Get dedication songs
     */
    public function getDedicationSongs(): array
    {
        return $this->music_ideas['dedication'] ?? [];
    }

    /**
     * Get play only if requested songs
     */
    public function getPlayOnlyIfRequestedSongs(): array
    {
        return $this->music_ideas['play_only_if_requested'] ?? [];
    }

    /**
     * Get do not play songs
     */
    public function getDoNotPlaySongs(): array
    {
        return $this->music_ideas['do_not_play'] ?? [];
    }

    /**
     * Get guest request songs
     */
    public function getGuestRequestSongs(): array
    {
        return $this->music_ideas['guest_request'] ?? [];
    }

    /**
     * Get total song count across all categories
     */
    public function getTotalSongCount(): int
    {
        $mustPlay = count($this->getMustPlaySongs());
        $playIfPossible = count($this->getPlayIfPossibleSongs());
        $dedication = count($this->getDedicationSongs());
        $playOnlyIfRequested = count($this->getPlayOnlyIfRequestedSongs());
        $doNotPlay = count($this->getDoNotPlaySongs());
        $guestRequest = count($this->getGuestRequestSongs());
        
        return $mustPlay + $playIfPossible + $dedication + $playOnlyIfRequested + $doNotPlay + $guestRequest;
    }

    /**
     * Get song count for a specific category
     */
    public function getCategorySongCount(string $category): int
    {
        switch ($category) {
            case 'must_play':
                return count($this->getMustPlaySongs());
            case 'play_if_possible':
                return count($this->getPlayIfPossibleSongs());
            case 'dedication':
                return count($this->getDedicationSongs());
            case 'play_only_if_requested':
                return count($this->getPlayOnlyIfRequestedSongs());
            case 'do_not_play':
                return count($this->getDoNotPlaySongs());
            case 'guest_request':
                return count($this->getGuestRequestSongs());
            default:
                return 0;
        }
    }

    /**
     * Check if category is within limit
     */
    public function isCategoryWithinLimit(string $category): bool
    {
        $limits = [
            'must_play' => 60,
            'play_if_possible' => 30,
            'dedication' => 10,
            'play_only_if_requested' => 5,
            'do_not_play' => 10,
            'guest_request' => null, // unlimited
        ];

        $limit = $limits[$category] ?? null;
        if ($limit === null) {
            return true; // unlimited
        }

        return $this->getCategorySongCount($category) <= $limit;
    }
}
