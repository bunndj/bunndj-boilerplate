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

// Protected routes (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    
    // Contact routes
    Route::post('/contact', [ContactController::class, 'submitContactForm']);
    
    // Event routes
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
});
