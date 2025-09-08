<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get all users (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Debug logging
        \Log::info('Users API called', [
            'total_users' => $users->total(),
            'current_page' => $users->currentPage(),
            'users_count' => $users->count(),
            'first_user' => $users->first()?->toArray()
        ]);

        return response()->json([
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    /**
     * Get single user
     */
    public function show(User $user): JsonResponse
    {
        return response()->json(['data' => $user]);
    }

    /**
     * Create new user (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|unique:users,username',
            'role' => ['required', Rule::in(['admin', 'dj', 'client'])],
            'organization' => 'nullable|string|max:255',
            'password' => 'required|string|min:8',
            'is_active' => 'boolean',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $user = User::create($validated);

        return response()->json(['data' => $user], 201);
    }

    /**
     * Update user (admin only)
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'username' => ['sometimes', 'string', Rule::unique('users', 'username')->ignore($user->id)],
            'role' => ['sometimes', Rule::in(['admin', 'dj', 'client'])],
            'organization' => 'nullable|string|max:255',
            'password' => 'sometimes|string|min:8',
            'is_active' => 'boolean',
        ]);

        // Hash password if provided
        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        $user->update($validated);

        return response()->json(['data' => $user]);
    }

    /**
     * Delete user (admin only)
     */
    public function destroy(User $user): JsonResponse
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Toggle user active status (admin only)
     */
    public function toggleStatus(User $user): JsonResponse
    {
        // Prevent admin from deactivating themselves
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot deactivate your own account'], 400);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json(['data' => $user]);
    }

    /**
     * Bulk actions on users (admin only)
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $userIds = $validated['user_ids'];
        $action = $validated['action'];

        // Remove current user from bulk actions
        $userIds = array_filter($userIds, fn($id) => $id !== auth()->id());

        if (empty($userIds)) {
            return response()->json(['message' => 'No valid users selected'], 400);
        }

        switch ($action) {
            case 'activate':
                User::whereIn('id', $userIds)->update(['is_active' => true]);
                break;
            case 'deactivate':
                User::whereIn('id', $userIds)->update(['is_active' => false]);
                break;
            case 'delete':
                User::whereIn('id', $userIds)->delete();
                break;
        }

        return response()->json(['message' => 'Bulk action completed successfully']);
    }
}
