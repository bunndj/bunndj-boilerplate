<?php

namespace App\Http\Controllers;

use App\Models\EventDocument;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Spatie\PdfToText\Pdf;
use Exception;

class DocumentController extends Controller
{
    /**
     * Upload and parse a document
     */
    public function uploadAndParse(Request $request): JsonResponse
    {
        // Increase execution time limit for document processing
        $maxExecutionTime = config('services.openai.max_execution_time', 300);
        set_time_limit($maxExecutionTime);
        ini_set('max_execution_time', $maxExecutionTime);
        
        try {
            $validator = Validator::make($request->all(), [
                'event_id' => 'required|exists:events,id',
                'document' => 'required|file|mimes:pdf|max:10240', // 10MB max
                'document_type' => 'required|in:pdf,email,note',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $event = Event::findOrFail($request->event_id);
            
            // Check if user owns the event
            if ($event->dj_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this event'
                ], 403);
            }

            $file = $request->file('document');
            $originalFilename = $file->getClientOriginalName();
            $fileSize = $file->getSize();
            $mimeType = $file->getMimeType();

            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.pdf';
            $filePath = 'event-documents/' . $event->id . '/' . $filename;

            // Upload to S3
            $s3Path = Storage::disk('s3')->put($filePath, $file, 'public');

            if (!$s3Path) {
                throw new Exception('Failed to upload file to S3');
            }

            // Parse PDF content
            $pdfContent = $this->parsePdfContent($file->getPathname());

            // Analyze content with OpenAI (with timeout protection)
            try {
                $parsedData = $this->analyzeContentWithOpenAI($pdfContent);
            } catch (Exception $e) {
                Log::error('Document analysis failed: ' . $e->getMessage());
                
                // If analysis fails, use basic fallback
                $parsedData = [
                    'extracted_fields' => [],
                    'confidence_score' => 0,
                    'raw_text' => substr($pdfContent, 0, 1000),
                    'analysis_timestamp' => now()->toISOString(),
                    'ai_model' => 'fallback',
                    'ai_response' => 'Analysis failed: ' . $e->getMessage(),
                ];
            }

            // Create document record
            $document = EventDocument::create([
                'event_id' => $event->id,
                'document_type' => $request->document_type,
                'file_path' => $filePath,
                'original_filename' => $originalFilename,
                'file_size' => $fileSize,
                'mime_type' => $mimeType,
                'parsed_data' => $parsedData,
                'is_processed' => true,
                'uploaded_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded and parsed successfully',
                'data' => [
                    'document' => $document,
                    'parsed_data' => $parsedData,
                    's3_url' => Storage::disk('s3')->url($filePath)
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Document upload error: ' . $e->getMessage(), [
                'event_id' => $request->event_id ?? null,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload and parse document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Parse PDF content using Spatie PDF to Text
     */
    private function parsePdfContent(string $filePath): string
    {
        try {
            return (new Pdf())
                ->setPdf($filePath)
                ->setOptions([
                    'layout', // Maintain layout
                    'raw',    // Raw text output
                ])
                ->text();
        } catch (Exception $e) {
            Log::error('PDF parsing error: ' . $e->getMessage());
            throw new Exception('Failed to parse PDF content: ' . $e->getMessage());
        }
    }

    /**
     * Analyze content with OpenAI to extract form fields
     */
    private function analyzeContentWithOpenAI(string $content): array
    {
        try {
            $openaiApiKey = config('services.openai.api_key');
            
            if (!$openaiApiKey) {
                // Fallback to basic extraction if OpenAI is not configured
                return $this->fallbackExtraction($content);
            }

            $systemPrompt = $this->getSystemPrompt();
            $userPrompt = $this->getUserPrompt($content);

            $timeout = config('services.openai.timeout', 120);
            $response = Http::timeout($timeout)->withHeaders([
                'Authorization' => 'Bearer ' . $openaiApiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt]
                ],
                'temperature' => 0.1,
                'max_tokens' => 4000,
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $aiResponse = $result['choices'][0]['message']['content'] ?? '';
                
                // Parse the AI response
                $extractedFields = $this->parseAIResponse($aiResponse);
                
                return [
                    'extracted_fields' => $extractedFields,
                    'confidence_score' => $this->calculateConfidenceScore($extractedFields),
                    'raw_text' => substr($content, 0, 1000),
                    'analysis_timestamp' => now()->toISOString(),
                    'ai_model' => 'gpt-4o-mini',
                    'ai_response' => $aiResponse,
                ];
            } else {
                Log::warning('OpenAI API call failed, falling back to basic extraction', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                return $this->fallbackExtraction($content);
            }

        } catch (Exception $e) {
            Log::error('OpenAI analysis error: ' . $e->getMessage());
            
            // Check if it's a timeout error
            if (strpos($e->getMessage(), 'timeout') !== false || strpos($e->getMessage(), 'Maximum execution time') !== false) {
                Log::warning('OpenAI request timed out, using fallback extraction');
            }
            
            return $this->fallbackExtraction($content);
        }
    }

    /**
     * Get the system prompt for OpenAI
     */
    private function getSystemPrompt(): string
    {
        return "You are an expert event planning assistant. Your task is to intelligently extract information from ANY type of event planning document and return it in a structured JSON format.

IMPORTANT: You must return ONLY valid JSON. No explanations, no additional text.

DOCUMENT ANALYSIS APPROACH:
- Analyze the document structure and content intelligently
- Look for information in various formats (lists, paragraphs, tables, notes)
- Extract information regardless of document layout or style
- Use context clues to understand what information is being conveyed
- Be flexible with field mapping - if you see relevant info, extract it

Extract the following fields and map them to the exact field names specified:

PLANNING FORM FIELDS:
- guestCount: Number of guests/attendees (integer, look for numbers followed by 'guests', 'people', 'confirmed', etc.)
- mailingAddress: Any address mentioned (string, could be venue, location, etc.)
- coordinatorEmail: Any coordinator/planner contact info (string)
- photographerEmail: Photographer contact info (string)
- videographerEmail: Videographer contact info (string)
- isWedding: Boolean (true if wedding mentioned, false if other event)
- ceremonyStartTime: Any ceremony time mentioned (string, any time format)
- ceremonyLocation: Ceremony venue/location (string)
- officiantName: Officiant/minister/officiant name (string)
- providingCeremonyMusic: Boolean (if music for ceremony is mentioned)
- guestArrivalMusic: Music style for guest arrival (string)
- ceremonyNotes: Any ceremony-related notes (string)
- providingCeremonyMicrophones: Boolean (if microphones mentioned)
- whoNeedsMic: Who needs microphone (string)
- ceremonyDjNotes: DJ notes for ceremony (string)
- uplighting: Boolean (if uplighting/lighting effects mentioned)
- uplightingColor: Uplighting color preference (string)
- uplightingNotes: Uplighting notes (string)
- photoBooth: Boolean (if photo booth mentioned)
- photoBoothLocation: Photo booth setup location (string)
- logoDesign: Logo design preference (string)
- photoText: Text for photos (string)
- photoColorScheme: Photo frame color scheme (string)
- ledRingColor: LED ring color (string)
- backdrop: Backdrop preference (string)
- photoEmailLocation: Email for photo delivery (string)
- cocktailHourMusic: Boolean (if cocktail hour music mentioned)
- cocktailHourLocation: Cocktail hour location (string)
- cocktailMusic: Cocktail hour music style (string)
- cocktailNotes: Cocktail hour notes (string)
- introductionsTime: Time for introductions (string, any time format)
- parentsEntranceSong: Parents entrance song (string)
- weddingPartyIntroSong: Wedding party intro song (string)
- coupleIntroSong: Couple intro song (string)
- weddingPartyIntroductions: Wedding party intro details (string)
- specialDances: Special dance details (string)
- otherNotes: Any other notes (string)
- dinnerMusic: Dinner music style (string)
- dinnerStyle: Dinner style (string)
- welcomeBy: Welcome speaker (string)
- blessingBy: Blessing speaker (string)
- toasts: Toast details (string)
- receptionNotes: Reception notes (string)
- exitDescription: Exit description (string)
- otherComments: Other comments (string)
- spotifyPlaylists: Spotify playlist URLs or descriptions (string)
- lineDances: Line dance preferences (string)
- takeRequests: Request policy (string)
- musicNotes: General music notes (string)

MUSIC IDEAS FIELDS:
- songs: Array of song objects with: 
  * title: Full song title (string, do not truncate)
  * artist: Full artist name (string, do not truncate)
  * category: One of (must_play, play_if_possible, dedication, play_only_if_requested, do_not_play, guest_request)
  * client_visible_title: Same as title (string, do not truncate)

TIMELINE FIELDS:
- timeline_times: Array of ALL time strings found in document (any format: 2pm, 2:00 PM, 14:00, etc.)
- timeline_activities: Array of activity descriptions corresponding to each time (extract the activity description that follows each time)
- ceremonyStartTime: Ceremony start time (string, any time format)
- cocktailHourStartTime: Cocktail hour start time (string, any time format)
- dinnerStartTime: Dinner start time (string, any time format)
- receptionStartTime: Reception start time (string, any time format)
- introductionsTime: Time for introductions (string, any time format)

EXTRACTION STRATEGY:
1. Scan the entire document for ANY time references (2pm, 2:00 PM, 14:00, etc.)
2. For each time found, extract the activity description that follows it (up to the next time or end of line)
3. Look for ANY song titles and artist names (in quotes, after 'SONG:', etc.)
4. Extract ANY numbers that might represent guest counts
5. Look for ANY addresses, locations, or venue information
6. Find ANY contact information (emails, names with titles)
7. Identify ANY music-related information
8. Extract ANY notes or comments about the event

RULES:
1. If a field is not found, set it to null
2. For boolean fields, use true/false only
3. For arrays, use empty array [] if none found
4. Extract exact text when possible, don't paraphrase
5. For times, accept ANY time format found in the document
6. For addresses, include whatever address information is available
7. For emails, extract complete email addresses
8. For songs, categorize based on context clues in the text
9. For timeline data, extract ALL times mentioned anywhere in the document
10. For each time, extract the activity description that follows it (e.g., '1pm First look with bridesmaids - at Airbnb')
11. For song titles and artist names, NEVER truncate - use the complete text
12. Be flexible with field mapping - if you see relevant info, extract it
13. Don't assume document structure - scan the entire content

Return ONLY the JSON object with these exact field names.";
    }

    /**
     * Get the user prompt with document content
     */
    private function getUserPrompt(string $content): string
    {
        return "Please analyze this event planning document and extract all the relevant information into the specified JSON format. The document may be structured in various ways (lists, paragraphs, notes, etc.) - analyze the entire content intelligently.

Here's the document content:

" . substr($content, 0, 8000) . "

Extract all the information you can find and return it in the exact JSON format specified in the system prompt. Be thorough and look for information in any format or location within the document.";
    }

    /**
     * Parse the AI response into structured data
     */
    private function parseAIResponse(string $aiResponse): array
    {
        try {
            // Clean the response to extract just the JSON
            $jsonStart = strpos($aiResponse, '{');
            $jsonEnd = strrpos($aiResponse, '}');
            
            if ($jsonStart !== false && $jsonEnd !== false) {
                $jsonString = substr($aiResponse, $jsonStart, $jsonEnd - $jsonStart + 1);
                $parsed = json_decode($jsonString, true);
                
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $parsed;
                }
            }
            
            // If JSON parsing fails, try to extract key-value pairs
            return $this->extractKeyValuePairs($aiResponse);
            
        } catch (Exception $e) {
            Log::error('Failed to parse AI response: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Fallback extraction method if OpenAI fails
     */
    private function fallbackExtraction(string $content): array
    {
        // Set a reasonable timeout for fallback processing
        set_time_limit(60); // 1 minute for fallback
        
        $extractedFields = [];
        
        // Basic extraction as fallback - be more flexible
        if (preg_match('/(\d+)\s*(?:guests?|people|attendees?|confirmed)/i', $content, $matches)) {
            $extractedFields['guestCount'] = (int) $matches[1];
        }
        
        // Look for any address-like patterns
        if (preg_match('/(\d+\s+[^,]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|place|pl|boulevard|blvd)[^,]*,\s*[^,]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?)/i', $content, $matches)) {
            $extractedFields['mailingAddress'] = trim($matches[1]);
        } elseif (preg_match('/([^,]+,\s*[^,]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?)/i', $content, $matches)) {
            $extractedFields['mailingAddress'] = trim($matches[1]);
        }
        
        // Extract emails
        $emailPattern = '/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/';
        preg_match_all($emailPattern, $content, $emails);
        if (!empty($emails[0])) {
            $extractedFields['emails'] = array_unique($emails[0]);
        }
        
        // Extract ALL times mentioned in the document (more flexible patterns)
        $timePatterns = [
            '/(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)/i',  // 2:30 PM
            '/(\d{1,2})(am|pm|AM|PM)/i',              // 2pm
            '/(\d{1,2}):(\d{2})/i',                   // 14:30
            '/(\d{1,2})/i',                           // 2 (if followed by context)
            '/(\d{1,2})\s*(am|pm|AM|PM)/i',           // 2 PM (with space)
            '/(\d{1,2})pm/i',                         // 5pm (no space)
            '/(\d{1,2})am/i',                         // 5am (no space)
        ];
        
        $allTimes = [];
        foreach ($timePatterns as $pattern) {
            preg_match_all($pattern, $content, $times);
            if (!empty($times[0])) {
                $allTimes = array_merge($allTimes, $times[0]);
            }
        }
        
                    if (!empty($allTimes)) {
                $extractedFields['timeline_times'] = array_unique($allTimes);
                
                // Try to extract activities that follow each time
                $activities = [];
                foreach ($allTimes as $time) {
                    // Look for text that follows the time (up to next time or end of line)
                    $timePos = strpos($content, $time);
                    if ($timePos !== false) {
                        $afterTime = substr($content, $timePos + strlen($time));
                        // Extract text until next time or end of line
                        $nextTimePos = strpos($afterTime, 'pm') !== false ? strpos($afterTime, 'pm') : strpos($afterTime, 'am');
                        if ($nextTimePos !== false) {
                            $activity = trim(substr($afterTime, 0, $nextTimePos));
                        } else {
                            $activity = trim(substr($afterTime, 0, 100)); // Take first 100 chars
                        }
                        $activities[] = $activity ?: 'Activity';
                    } else {
                        $activities[] = 'Activity';
                    }
                }
                $extractedFields['timeline_activities'] = $activities;
                
                // Try to identify specific times based on context
                foreach ($allTimes as $time) {
                    $lowerTime = strtolower($time);
                    $timeValue = $time;
                    
                    // Look for ceremony time (usually around 5pm)
                    if (strpos($lowerTime, '5pm') !== false || strpos($lowerTime, '5:00') !== false) {
                        $extractedFields['ceremonyStartTime'] = $timeValue;
                    }
                    
                    // Look for cocktail hour time (usually around 5pm)
                    if (strpos($lowerTime, '5pm') !== false || strpos($lowerTime, '5:00') !== false) {
                        $extractedFields['cocktailHourStartTime'] = $timeValue;
                    }
                    
                    // Look for dinner time (usually around 7pm)
                    if (strpos($lowerTime, '7pm') !== false || strpos($lowerTime, '7:00') !== false) {
                        $extractedFields['dinnerStartTime'] = $timeValue;
                    }
                    
                    // Look for reception time (usually around 6pm or 7pm)
                    if (strpos($lowerTime, '6pm') !== false || strpos($lowerTime, '6:00') !== false || 
                        strpos($lowerTime, '7pm') !== false || strpos($lowerTime, '7:00') !== false) {
                        $extractedFields['receptionStartTime'] = $timeValue;
                    }
                    
                    // Look for introductions time (usually around 6:45pm)
                    if (strpos($lowerTime, '6:45') !== false || strpos($lowerTime, '6:45pm') !== false) {
                        $extractedFields['introductionsTime'] = $timeValue;
                    }
                }
            }
        
        // Extract officiant information
        if (preg_match('/(?:officiant|minister|priest|rabbi):\s*([^,\n]+)/i', $content, $matches)) {
            $extractedFields['officiantName'] = trim($matches[1]);
        }
        
        // Extract boolean fields
        if (preg_match('/(?:uplighting|up.?lighting)/i', $content)) {
            $extractedFields['uplighting'] = true;
        }
        
        if (preg_match('/(?:photo.?booth|photobooth)/i', $content)) {
            $extractedFields['photoBooth'] = true;
        }
        
        // Extract song information more flexibly
        $songPatterns = [
            '/SONG:\s*([^-\n]+?)\s*-\s*([^,\n]+)/i',  // SONG: Title - Artist
            '/"([^"]+)"\s*-\s*([^,\n]+)/i',            // "Title" - Artist
            '/([A-Z][^.!?]*?(?:song|music|tune)[^.!?]*?)/i'  // General song references
        ];
        
        $songs = [];
        foreach ($songPatterns as $pattern) {
            preg_match_all($pattern, $content, $matches);
            if (!empty($matches[1])) {
                for ($i = 0; $i < count($matches[1]); $i++) {
                    $title = trim($matches[1][$i]);
                    $artist = isset($matches[2][$i]) ? trim($matches[2][$i]) : '';
                    
                    if (!empty($title)) {
                        $songs[] = [
                            'title' => $title,
                            'artist' => $artist,
                            'category' => 'play_if_possible',
                            'client_visible_title' => $title
                        ];
                    }
                }
            }
        }
        
        if (!empty($songs)) {
            $extractedFields['songs'] = $songs;
        }
        
        return [
            'extracted_fields' => $extractedFields,
            'confidence_score' => 40, // Slightly higher confidence for improved fallback
            'raw_text' => substr($content, 0, 1000),
            'analysis_timestamp' => now()->toISOString(),
            'ai_model' => 'fallback',
            'ai_response' => 'Fallback extraction used - OpenAI timed out',
        ];
    }

    /**
     * Extract key-value pairs from AI response if JSON parsing fails
     */
    private function extractKeyValuePairs(string $response): array
    {
        $fields = [];
        
        // Look for common patterns in the AI response
        $patterns = [
            'guestCount' => '/(\d+)\s*(?:guests?|people|attendees?)/i',
            'mailingAddress' => '/(\d+\s+[^,]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|place|pl|boulevard|blvd)[^,]*,\s*[^,]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?)/i',
            'ceremonyStartTime' => '/(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)/i',
            'officiantName' => '/(?:officiant|minister|priest|rabbi):\s*([^,\n]+)/i',
        ];
        
        foreach ($patterns as $field => $pattern) {
            if (preg_match($pattern, $response, $matches)) {
                $fields[$field] = trim($matches[1] ?? $matches[0]);
            }
        }
        
        return $fields;
    }

    /**
     * Calculate confidence score for extracted data
     */
    private function calculateConfidenceScore(array $extractedFields): float
    {
        $score = 0;
        $totalFields = 0;

        // Weight different types of fields
        $weights = [
            'guestCount' => 0.8,
            'mailingAddress' => 0.9,
            'coordinatorEmail' => 0.7,
            'photographerEmail' => 0.7,
            'videographerEmail' => 0.7,
            'ceremonyStartTime' => 0.8,
            'ceremonyLocation' => 0.8,
            'officiantName' => 0.7,
            'songs' => 0.6,
        ];

        foreach ($weights as $field => $weight) {
            if (isset($extractedFields[$field]) && !empty($extractedFields[$field])) {
                $score += $weight;
            }
            $totalFields++;
        }

        return $totalFields > 0 ? ($score / $totalFields) * 100 : 0;
    }

    /**
     * Get documents for an event
     */
    public function getEventDocuments(int $eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);
            
            if ($event->dj_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this event'
                ], 403);
            }

            $documents = EventDocument::where('event_id', $eventId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $documents
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching event documents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a document
     */
    public function deleteDocument(int $documentId): JsonResponse
    {
        try {
            $document = EventDocument::findOrFail($documentId);
            $event = Event::findOrFail($document->event_id);
            
            if ($event->dj_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this event'
                ], 403);
            }

            // Delete from S3
            if (Storage::disk('s3')->exists($document->file_path)) {
                Storage::disk('s3')->delete($document->file_path);
            }

            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);

        } catch (Exception $e) {
            Log::error('Error deleting document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
