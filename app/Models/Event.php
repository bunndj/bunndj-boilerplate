<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'event_type',
        'event_date',
        'setup_time',
        'start_time',
        'end_time',
        'booking_status',
        'service_package',
        'service_description',
        'guest_count',
        'dj_id',
        'venue_name',
        'venue_address',
        'venue_city',
        'venue_state',
        'venue_zipcode',
        'venue_phone',
        'venue_email',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'setup_time' => 'datetime',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    /**
     * Get the DJ that owns this event
     */
    public function dj()
    {
        return $this->belongsTo(User::class, 'dj_id');
    }

    /**
     * Get all documents for this event
     */
    public function documents()
    {
        return $this->hasMany(EventDocument::class);
    }

    /**
     * Get planning data for this event (one-to-one)
     */
    public function planning()
    {
        return $this->hasOne(EventPlanning::class);
    }

    /**
     * Get music ideas for this event (one-to-one)
     */
    public function musicIdeas()
    {
        return $this->hasOne(EventMusicIdeas::class);
    }

    /**
     * Get the full venue address
     */
    public function getFullVenueAddressAttribute(): string
    {
        $parts = array_filter([
            $this->venue_address,
            $this->venue_city,
            $this->venue_state,
            $this->venue_zipcode
        ]);

        return implode(', ', $parts);
    }

    /**
     * Get the event progress percentage
     */
    public function getProgressPercentageAttribute(): int
    {
        if (!$this->planning) {
            return 0;
        }

        return $this->planning->getCompletionPercentage();
    }
}
