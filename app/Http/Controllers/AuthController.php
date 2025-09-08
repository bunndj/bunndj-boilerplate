<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'organization' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'role' => 'nullable|in:dj,client',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'organization' => $request->organization,
            'home_phone' => $request->phone, // Map phone to home_phone
            'role' => $request->role ?? 'dj', // Default to DJ if not specified
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Registration successful'
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        $user = Auth::user();

        // Check if the user account is active
        if (!$user->is_active) {
            Auth::logout(); // Log out the user immediately
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact an administrator for assistance.'
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Login successful'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user();

        // Check if the user account is still active
        if (!$user->is_active) {
            // Revoke the current token
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact an administrator for assistance.'
            ], 403);
        }

        return response()->json([
            'user' => $user
        ]);
    }

    public function registerViaInvitation(Request $request, int $id)
    {
        // First, validate the invitation ID
        $invitation = \App\Models\Invitation::where('id', $id)->first();
        
        if (!$invitation) {
            return response()->json(['message' => 'Invalid invitation ID'], 404);
        }

        if ($invitation->isExpired()) {
            $invitation->markAsExpired();
            return response()->json(['message' => 'Invitation has expired'], 410);
        }

        if ($invitation->isAccepted()) {
            return response()->json(['message' => 'Invitation already accepted'], 409);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone' => 'nullable|string|max:255',
        ]);

        // Verify email matches invitation
        if ($request->email !== $invitation->client_email) {
            return response()->json(['message' => 'Email does not match invitation'], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'home_phone' => $request->phone,
            'role' => 'client',
        ]);

        // Accept the invitation
        $invitation->markAsAccepted();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Registration successful and invitation accepted',
            'invitation' => $invitation->load(['event', 'dj'])
        ], 201);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'organization' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'cell_phone' => 'nullable|string|max:255',
            'home_phone' => 'nullable|string|max:255',
            'work_phone' => 'nullable|string|max:255',
            'fax_phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'zipcode' => 'nullable|string|max:255',
        ]);

        try {
            $user->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile'
            ], 500);
        }
    }
}
