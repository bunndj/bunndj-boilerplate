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


}
