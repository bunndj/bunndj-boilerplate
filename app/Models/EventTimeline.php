<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventTimeline extends Model
{
    use HasFactory;

    protected $table = 'event_timeline';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'event_id',
        'timeline_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'timeline_data' => 'array',
        ];
    }

    /**
     * Get the event that owns this timeline
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
