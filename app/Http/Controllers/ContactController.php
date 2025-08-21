<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Submit contact form
     */
    public function submitContactForm(Request $request): JsonResponse
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'subject' => 'required|string|max:255',
                'message' => 'required|string|max:5000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            $subject = $request->input('subject');
            $message = $request->input('message');

            // Log the contact form submission
            Log::info('Contact form submitted', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_name' => $user->name,
                'subject' => $subject,
                'message' => $message,
                'timestamp' => now()
            ]);

            // TODO: Implement email sending functionality
            // For now, we'll just log the submission
            // In a production environment, you would send an email to the support team
            
            /*
            // Example email implementation (uncomment and configure when ready):
            Mail::send('emails.contact', [
                'user' => $user,
                'subject' => $subject,
                'message' => $message
            ], function ($mail) use ($user, $subject) {
                $mail->to('info@bunndjcompany.com')
                     ->subject('Contact Form: ' . $subject)
                     ->from($user->email, $user->name);
            });
            */

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully. We will get back to you soon!'
            ]);

        } catch (\Exception $e) {
            Log::error('Contact form submission failed', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send your message. Please try again later.'
            ], 500);
        }
    }
}
