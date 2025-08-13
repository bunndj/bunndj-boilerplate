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
     * Add a song to must play list
     */
    public function addMustPlaySong(string $musicType, array $songData): void
    {
        $musicIdeas = $this->music_ideas ?? ['must_play' => [], 'play_if_possible' => []];
        $musicIdeas['must_play'][] = array_merge(['music_type' => $musicType], $songData);
        $this->music_ideas = $musicIdeas;
    }

    /**
     * Add a song to play if possible list
     */
    public function addPlayIfPossibleSong(string $musicType, array $songData): void
    {
        $musicIdeas = $this->music_ideas ?? ['must_play' => [], 'play_if_possible' => []];
        $musicIdeas['play_if_possible'][] = array_merge(['music_type' => $musicType], $songData);
        $this->music_ideas = $musicIdeas;
    }

    /**
     * Get total song count
     */
    public function getTotalSongCount(): int
    {
        $mustPlay = count($this->getMustPlaySongs());
        $playIfPossible = count($this->getPlayIfPossibleSongs());
        return $mustPlay + $playIfPossible;
    }

    /**
     * Get must play song count
     */
    public function getMustPlayCount(): int
    {
        return count($this->getMustPlaySongs());
    }

    /**
     * Get play if possible song count
     */
    public function getPlayIfPossibleCount(): int
    {
        return count($this->getPlayIfPossibleSongs());
    }
}
