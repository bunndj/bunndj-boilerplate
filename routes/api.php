<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventPlanningController;
use App\Http\Controllers\EventMusicIdeasController;
use App\Http\Controllers\EventTimelineController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Invitation routes (public)
Route::get('/invitations/{id}', [InvitationController::class, 'getInvitationById']);
Route::post('/register/invitation/{id}', [AuthController::class, 'registerViaInvitation']);

// Protected routes (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // Dashboard routes - role-based access
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    
    // Contact routes
    Route::post('/contact', [ContactController::class, 'submitContactForm']);
    
    // Event routes - DJ and Admin only
    Route::middleware('role:admin_or_dj')->group(function () {
        Route::apiResource('events', EventController::class);
        
        // Event Planning routes
        Route::get('events/{event}/planning', [EventPlanningController::class, 'show']);
        Route::post('events/{event}/planning', [EventPlanningController::class, 'store']);
        Route::put('events/{event}/planning', [EventPlanningController::class, 'update']);
        
        // Event Music Ideas routes
        Route::get('events/{event}/music-ideas', [EventMusicIdeasController::class, 'show']);
        Route::post('events/{event}/music-ideas', [EventMusicIdeasController::class, 'store']);
        Route::put('events/{event}/music-ideas', [EventMusicIdeasController::class, 'update']);
        
        // Event Timeline routes
        Route::get('events/{event}/timeline', [EventTimelineController::class, 'show']);
        Route::post('events/{event}/timeline', [EventTimelineController::class, 'store']);
        Route::put('events/{event}/timeline', [EventTimelineController::class, 'store']);
        
        // Document routes - DJ only
        Route::middleware('role:dj')->group(function () {
            Route::post('events/{event}/documents/upload', [DocumentController::class, 'uploadAndParse']);
            Route::post('events/{event}/documents/parse-notes', [DocumentController::class, 'parseNotes']);
            Route::get('events/{event}/documents', [DocumentController::class, 'getEventDocuments']);
            Route::delete('documents/{document}', [DocumentController::class, 'deleteDocument']);
        });
    });
    
    // Client event access - only for invited events
    Route::middleware('role:client')->group(function () {
        Route::get('/client/events', [EventController::class, 'getClientEvents']);
        Route::get('/client/events/{event}', [EventController::class, 'getClientEvent']);
        Route::get('/client/events/{event}/planning', [EventPlanningController::class, 'show']);
        Route::put('/client/events/{event}/planning', [EventPlanningController::class, 'update']);
        Route::get('/client/events/{event}/music-ideas', [EventMusicIdeasController::class, 'show']);
        Route::put('/client/events/{event}/music-ideas', [EventMusicIdeasController::class, 'update']);
        Route::get('/client/events/{event}/timeline', [EventTimelineController::class, 'show']);
        Route::put('/client/events/{event}/timeline', [EventTimelineController::class, 'update']);
        
        // Client document upload routes
        Route::post('/client/events/{event}/documents/upload', [DocumentController::class, 'uploadAndParseForClient']);
        Route::post('/client/events/{event}/documents/parse-notes', [DocumentController::class, 'parseNotesForClient']);
    });

    // Invitation acceptance (requires authentication)
    Route::post('/invitations/{id}/accept', [InvitationController::class, 'acceptInvitation']);
    
    // Invitation routes
    Route::middleware('role:dj')->group(function () {
        Route::post('/invitations', [InvitationController::class, 'sendInvitation']);
        Route::get('/invitations', [InvitationController::class, 'getDjInvitations']);
        Route::delete('/invitations/{id}', [InvitationController::class, 'cancelInvitation']);
        Route::post('/invitations/{id}/resend', [InvitationController::class, 'resendInvitation']);
    });
    
    Route::middleware('role:client')->group(function () {
        Route::get('/client/invitations', [InvitationController::class, 'getClientInvitations']);
    });
    
    
    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/invitations/stats', [InvitationController::class, 'getInvitationStats']);
        
        // User management routes
        Route::apiResource('users', UserController::class);
        Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::post('users/bulk-action', [UserController::class, 'bulkAction']);
        
        // Admin events routes
        Route::get('/admin/events', [EventController::class, 'getAdminEvents']);
        Route::get('/admin/events/{event}', [EventController::class, 'show']);
    });
});
