<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update Drew Roberts admin user
        User::updateOrCreate(
            ['email' => 'dev@drewroberts.com'],
            [
                'name' => 'Drew Roberts',
                'password' => Hash::make('drew0119!!!'),
                'username' => 'drewroberts',
                'role' => 'admin',
                'is_active' => true,
                'sms_consent' => true,
            ]
        );

        // Create or update Joe Bunn admin user
        User::updateOrCreate(
            ['email' => 'joe@bunndjcompany.com'],
            [
                'name' => 'Joe Bunn',
                'password' => Hash::make('12345678'),
                'username' => 'joebunn',
                'role' => 'admin',
                'is_active' => true,
                'sms_consent' => true,
            ]
        );
    }
}
