<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'calendar_link',
        'organization',
        'website',
        'home_phone',
        'cell_phone',
        'work_phone',
        'fax_phone',
        'address',
        'address_line_2',
        'city',
        'state',
        'zipcode',
        'username',
        'role',
        'sms_consent',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'sms_consent' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is a DJ
     */
    public function isDj(): bool
    {
        return $this->role === 'dj';
    }

    /**
     * Check if user is a client
     */
    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    /**
     * Get all events created by this DJ
     */
    public function events()
    {
        return $this->hasMany(Event::class, 'dj_id');
    }

    /**
     * Get all documents uploaded by this user
     */
    public function uploadedDocuments()
    {
        return $this->hasMany(EventDocument::class, 'uploaded_by');
    }

    /**
     * Get all invitations sent by this DJ
     */
    public function sentInvitations()
    {
        return $this->hasMany(Invitation::class, 'dj_id');
    }

    /**
     * Get all invitations received by this client
     */
    public function receivedInvitations()
    {
        return $this->hasMany(Invitation::class, 'client_email', 'email');
    }

    /**
     * Get all events this client is invited to
     */
    public function invitedEvents()
    {
        return $this->hasManyThrough(Event::class, Invitation::class, 'client_email', 'id', 'email', 'event_id')
                    ->where('invitations.status', 'accepted');
    }

    /**
     * Get the DJ for this client (through accepted invitations)
     */
    public function assignedDj()
    {
        return $this->hasOneThrough(User::class, Invitation::class, 'client_email', 'id', 'email', 'dj_id')
                    ->where('invitations.status', 'accepted');
    }

    /**
     * Get all clients for this DJ (through sent invitations)
     */
    public function clients()
    {
        return $this->hasManyThrough(User::class, Invitation::class, 'dj_id', 'email', 'id', 'client_email')
                    ->where('invitations.status', 'accepted');
    }
}
