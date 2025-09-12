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
     * Parse notes text using AI
     */
    public function parseNotes(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'event_id' => 'required|exists:events,id',
                'notes' => 'required|string|max:10000',
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

            $notes = $request->input('notes');

            // Clean the notes content to ensure UTF-8 compliance before OpenAI analysis
            $cleanNotes = $this->cleanUtf8Text($notes);

            // Analyze notes with OpenAI (same logic as document parsing)
            try {
                $parsedData = $this->analyzeContentWithOpenAI($cleanNotes);
            } catch (Exception $e) {
                Log::error('Notes analysis failed: ' . $e->getMessage());
                
                // If analysis fails, use basic fallback
                $parsedData = [
                    'extracted_fields' => [],
                    'confidence_score' => 0,
                    'raw_text' => substr($notes, 0, 1000),
                    'analysis_timestamp' => now()->toISOString(),
                    'ai_model' => 'fallback',
                    'ai_response' => 'Analysis failed: ' . $e->getMessage(),
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Notes parsed successfully',
                'data' => $parsedData
            ]);

        } catch (Exception $e) {
            Log::error('Notes parsing error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to parse notes: ' . $e->getMessage()
            ], 500);
        }
    }

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
            \Log::info('=== DOCUMENT UPLOAD DEBUG ===');
            \Log::info('Document uploadAndParse method called', [
                'user_authenticated' => auth()->check(),
                'user_id' => auth()->id(),
                'user_role' => auth()->user()?->role,
                'user_email' => auth()->user()?->email,
                'request_data' => $request->all()
            ]);

            $validator = Validator::make($request->all(), [
                'event_id' => 'required|exists:events,id',
                'document' => 'required|file|mimes:pdf|max:10240', // 10MB max
                'document_type' => 'required|in:pdf,email,note',
            ]);

            if ($validator->fails()) {
                \Log::warning('Document upload validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $event = Event::findOrFail($request->event_id);
            
            \Log::info('Event found for document upload', [
                'event_id' => $event->id,
                'event_name' => $event->name,
                'event_dj_id' => $event->dj_id,
                'auth_user_id' => auth()->id(),
                'is_dj_owner' => $event->dj_id === auth()->id()
            ]);
            
            // Check if user owns the event
            if ($event->dj_id !== auth()->id()) {
                \Log::warning('User does not own the event', [
                    'event_id' => $event->id,
                    'event_dj_id' => $event->dj_id,
                    'auth_user_id' => auth()->id(),
                    'user_role' => auth()->user()?->role
                ]);
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
                'file_size' => (string) $fileSize,
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
            $rawText = (new Pdf())
                ->setPdf($filePath)
                ->setOptions([
                    'layout', // Maintain layout
                    'raw',    // Raw text output
                ])
                ->text();
            
            // Clean and ensure valid UTF-8 encoding
            return $this->cleanUtf8Text($rawText);
            
        } catch (Exception $e) {
            Log::error('PDF parsing error: ' . $e->getMessage());
            throw new Exception('Failed to parse PDF content: ' . $e->getMessage());
        }
    }

    /**
     * Clean and ensure valid UTF-8 text
     */
    private function cleanUtf8Text(string $text): string
    {
        // Remove or replace invalid UTF-8 characters
        $cleanText = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
        
        // Remove null bytes and other problematic characters
        $cleanText = str_replace(["\0", "\x00"], '', $cleanText);
        
        // Remove or replace non-printable characters except newlines, tabs, and carriage returns
        $cleanText = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $cleanText);
        
        // Normalize line endings
        $cleanText = str_replace(["\r\n", "\r"], "\n", $cleanText);
        
        // Remove excessive whitespace while preserving structure
        $cleanText = preg_replace('/\n{3,}/', "\n\n", $cleanText);
        
        // Ensure the result is valid UTF-8
        if (!mb_check_encoding($cleanText, 'UTF-8')) {
            // Fallback: force UTF-8 conversion and remove invalid sequences
            $cleanText = mb_convert_encoding($cleanText, 'UTF-8', 'UTF-8');
            $cleanText = filter_var($cleanText, FILTER_SANITIZE_STRING, FILTER_FLAG_STRIP_LOW);
        }
        
        Log::info('Text cleaned for UTF-8 compliance', [
            'original_length' => strlen($text),
            'cleaned_length' => strlen($cleanText),
            'is_valid_utf8' => mb_check_encoding($cleanText, 'UTF-8')
        ]);
        
        return trim($cleanText);
    }

    /**
     * Analyze content with OpenAI to extract form fields
     */
    private function analyzeContentWithOpenAI(string $content): array
    {
        try {
            // Ensure the content is UTF-8 clean before processing
            if (!mb_check_encoding($content, 'UTF-8')) {
                Log::warning('Content passed to analyzeContentWithOpenAI has UTF-8 issues, cleaning');
                $content = $this->cleanUtf8Text($content);
            }
            
            $openaiApiKey = config('services.openai.api_key');
            
            if (!$openaiApiKey) {
                // Fallback to basic extraction if OpenAI is not configured
                return $this->fallbackExtraction($content);
            }

            $contentLength = strlen($content);
            Log::info('Document size check', [
                'content_length' => $contentLength,
                'mb_length' => mb_strlen($content, 'UTF-8'),
                'will_use_chunking' => $contentLength > 15000
            ]);

            // Use chunking strategy for very large documents
            if ($contentLength > 15000) {
                return $this->analyzeContentWithChunking($content);
            }

            // For smaller documents, use the single-request approach with optimizations
            return $this->analyzeSingleDocument($content);

        } catch (Exception $e) {
            Log::error('OpenAI analysis error', [
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Check if it's a timeout error
            if (strpos($e->getMessage(), 'timeout') !== false || 
                strpos($e->getMessage(), 'Maximum execution time') !== false ||
                strpos($e->getMessage(), 'Connection timed out') !== false ||
                strpos($e->getMessage(), 'cURL error 28') !== false) {
                Log::warning('OpenAI request timed out, using fallback extraction', [
                    'timeout_type' => 'network_timeout'
                ]);
            }
            
            return $this->fallbackExtraction($content);
        }
    }

    /**
     * Analyze content using chunking strategy for large documents
     */
    private function analyzeContentWithChunking(string $content): array
    {
        Log::info('Using chunking strategy for large document', ['content_length' => strlen($content)]);
        
        // Split content into chunks of ~12KB each with overlap
        $chunkSize = 12000;
        $overlap = 2000;
        $chunks = $this->splitContentIntoChunks($content, $chunkSize, $overlap);
        
        Log::info('Content split into chunks', [
            'total_chunks' => count($chunks),
            'chunk_sizes' => array_map('strlen', $chunks)
        ]);

        $allExtractedFields = [];
        $allResponses = [];
        $successfulChunks = 0;

        foreach ($chunks as $index => $chunk) {
            try {
                Log::info("Processing chunk {$index}", ['chunk_size' => strlen($chunk)]);
                
                $chunkResult = $this->analyzeSingleChunk($chunk, $index, count($chunks));
                
                if (!empty($chunkResult['extracted_fields'])) {
                    $allExtractedFields[] = $chunkResult['extracted_fields'];
                    $allResponses[] = $chunkResult['ai_response'] ?? '';
                    $successfulChunks++;
                }
                
                // Add small delay between requests to avoid rate limiting
                if ($index < count($chunks) - 1) {
                    usleep(500000); // 0.5 second delay
                }
                
            } catch (Exception $e) {
                Log::warning("Failed to process chunk {$index}", [
                    'error' => $e->getMessage(),
                    'chunk_size' => strlen($chunk)
                ]);
                continue;
            }
        }

        // Merge results from all chunks
        $mergedFields = $this->mergeChunkResults($allExtractedFields);
        
        Log::info('Chunking analysis completed', [
            'successful_chunks' => $successfulChunks,
            'total_chunks' => count($chunks),
            'merged_fields_count' => count($mergedFields)
        ]);

        return [
            'extracted_fields' => $mergedFields,
            'confidence_score' => $this->calculateConfidenceScore($mergedFields),
            'raw_text' => substr($content, 0, 1000),
            'analysis_timestamp' => now()->toISOString(),
            'ai_model' => 'gpt-4o-mini-chunked',
            'ai_response' => 'Chunked analysis: ' . $successfulChunks . '/' . count($chunks) . ' chunks processed successfully',
        ];
    }

    /**
     * Analyze a single document (for smaller content)
     */
    private function analyzeSingleDocument(string $content): array
    {
        $systemPrompt = $this->getSystemPrompt();
        $userPrompt = $this->getUserPrompt($content);

        // Validate that the content can be JSON encoded before sending to OpenAI
        $testPayload = [
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt]
            ]
        ];
        
        $jsonTest = json_encode($testPayload);
        if ($jsonTest === false) {
            $jsonError = json_last_error_msg();
            Log::error('JSON encoding failed for OpenAI payload', [
                'json_error' => $jsonError,
                'json_error_code' => json_last_error(),
                'content_length' => strlen($content),
                'user_prompt_length' => strlen($userPrompt)
            ]);
            throw new Exception("JSON encoding failed: {$jsonError}");
        }

        $response = $this->makeOpenAIRequest($systemPrompt, $userPrompt);

        if ($response['success']) {
            $extractedFields = $this->parseAIResponse($response['ai_response']);
            
            return [
                'extracted_fields' => $extractedFields,
                'confidence_score' => $this->calculateConfidenceScore($extractedFields),
                'raw_text' => substr($content, 0, 1000),
                'analysis_timestamp' => now()->toISOString(),
                'ai_model' => 'gpt-4o-mini',
                'ai_response' => $response['ai_response'],
            ];
        } else {
            return $this->fallbackExtraction($content);
        }
    }

    /**
     * Split content into chunks with overlap
     */
    private function splitContentIntoChunks(string $content, int $chunkSize, int $overlap): array
    {
        $chunks = [];
        $contentLength = strlen($content);
        $position = 0;

        while ($position < $contentLength) {
            $chunk = substr($content, $position, $chunkSize);
            $chunks[] = $chunk;
            
            // Move position forward by chunkSize minus overlap
            $position += ($chunkSize - $overlap);
            
            // If remaining content is smaller than overlap, include it all in the last chunk
            if ($contentLength - $position < $overlap) {
                break;
            }
        }

        return $chunks;
    }

    /**
     * Analyze a single chunk
     */
    private function analyzeSingleChunk(string $chunk, int $chunkIndex, int $totalChunks): array
    {
        $systemPrompt = $this->getChunkSystemPrompt($chunkIndex, $totalChunks);
        $userPrompt = $this->getChunkUserPrompt($chunk, $chunkIndex, $totalChunks);

        $response = $this->makeOpenAIRequest($systemPrompt, $userPrompt);

        if ($response['success']) {
            $extractedFields = $this->parseAIResponse($response['ai_response']);
            return [
                'extracted_fields' => $extractedFields,
                'ai_response' => $response['ai_response']
            ];
        }

        return ['extracted_fields' => [], 'ai_response' => ''];
    }

    /**
     * Make OpenAI API request with enhanced error handling
     */
    private function makeOpenAIRequest(string $systemPrompt, string $userPrompt): array
    {
        $openaiApiKey = config('services.openai.api_key');
        $timeout = config('services.openai.timeout', 300);
        $connectTimeout = config('services.openai.connect_timeout', 30);
        $retryAttempts = config('services.openai.retry_attempts', 3);
        
        Log::info('Starting OpenAI API request', [
            'timeout' => $timeout,
            'connect_timeout' => $connectTimeout,
            'retry_attempts' => $retryAttempts,
            'user_prompt_length' => strlen($userPrompt)
        ]);
        
        try {
            $response = Http::timeout($timeout)
                ->connectTimeout($connectTimeout)
                ->retry($retryAttempts, 2000, function ($exception, $request) {
                    // Retry on timeout and rate limit errors
                    if ($exception instanceof \Illuminate\Http\Client\RequestException) {
                        $status = $exception->response?->status();
                        return in_array($status, [408, 429, 502, 503, 504]);
                    }
                    return strpos($exception->getMessage(), 'timeout') !== false;
                })
                ->withHeaders([
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
                
                Log::info('OpenAI API request successful', [
                    'response_time' => $response->handlerStats()['total_time'] ?? 'unknown',
                    'status_code' => $response->status(),
                    'ai_response_length' => strlen($aiResponse)
                ]);
                
                return [
                    'success' => true,
                    'ai_response' => $aiResponse
                ];
            } else {
                Log::error('OpenAI API call failed', [
                    'status' => $response->status(),
                    'response_body' => $response->body(),
                    'response_headers' => $response->headers()
                ]);
                return ['success' => false, 'ai_response' => ''];
            }

        } catch (Exception $e) {
            Log::error('OpenAI API request exception', [
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode()
            ]);
            return ['success' => false, 'ai_response' => ''];
        }
    }

    /**
     * Merge results from multiple chunks
     */
    private function mergeChunkResults(array $allExtractedFields): array
    {
        $merged = [];
        
        foreach ($allExtractedFields as $chunkFields) {
            foreach ($chunkFields as $key => $value) {
                if (!isset($merged[$key])) {
                    $merged[$key] = $value;
                } else {
                    // For arrays, merge them
                    if (is_array($value) && is_array($merged[$key])) {
                        $merged[$key] = array_unique(array_merge($merged[$key], $value));
                    }
                    // For strings, prefer non-empty values or combine them intelligently
                    elseif (is_string($value) && is_string($merged[$key])) {
                        if (empty($merged[$key]) && !empty($value)) {
                            $merged[$key] = $value;
                        } elseif (!empty($value) && !empty($merged[$key]) && $value !== $merged[$key]) {
                            // Combine different string values if they're not identical
                            $merged[$key] = $merged[$key] . '; ' . $value;
                        }
                    }
                    // For other types, prefer non-empty/non-zero values
                    else {
                        if (empty($merged[$key]) && !empty($value)) {
                            $merged[$key] = $value;
                        }
                    }
                }
            }
        }
        
        return $merged;
    }

    /**
     * Get system prompt for chunk analysis
     */
    private function getChunkSystemPrompt(int $chunkIndex, int $totalChunks): string
    {
        $basePrompt = $this->getSystemPrompt();
        
        return $basePrompt . "\n\nIMPORTANT: This is chunk " . ($chunkIndex + 1) . " of {$totalChunks} from a larger document. Extract all information you can find in this chunk, even if it seems incomplete. The chunks will be merged later.";
    }

    /**
     * Get user prompt for chunk analysis
     */
    private function getChunkUserPrompt(string $chunk, int $chunkIndex, int $totalChunks): string
    {
        // For chunks, don't truncate as aggressively since we're already working with smaller pieces
        $cleanChunk = $this->cleanUtf8Text($chunk);
        
        return "Please analyze this portion (chunk " . ($chunkIndex + 1) . " of {$totalChunks}) of an event planning document and extract all the relevant information into the specified JSON format.

Here's the document chunk:

" . $cleanChunk . "

Extract all the information you can find in this chunk and return it in the exact JSON format specified in the system prompt.";
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
        // Ensure content is clean and truncate intelligently to avoid UTF-8 issues
        $cleanContent = $this->cleanUtf8Text($content);
        
        // For single document analysis, use larger limit but still be reasonable
        $maxLength = 12000; // Increased from 8000
        $truncatedContent = mb_substr($cleanContent, 0, $maxLength, 'UTF-8');
        
        // Verify the truncated content is still valid UTF-8
        if (!mb_check_encoding($truncatedContent, 'UTF-8')) {
            Log::warning('Truncated content has UTF-8 issues, applying additional cleaning');
            $truncatedContent = mb_convert_encoding($truncatedContent, 'UTF-8', 'UTF-8');
        }
        
        return "Please analyze this event planning document and extract all the relevant information into the specified JSON format. The document may be structured in various ways (lists, paragraphs, notes, etc.) - analyze the entire content intelligently.

Here's the document content:

" . $truncatedContent . "

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

    /**
     * Upload and parse a document for client users
     */
    public function uploadAndParseForClient(Request $request): JsonResponse
    {
        // Increase execution time limit for document processing
        $maxExecutionTime = config('services.openai.max_execution_time', 300);
        set_time_limit($maxExecutionTime);
        ini_set('max_execution_time', $maxExecutionTime);
        
        try {
            \Log::info('=== CLIENT DOCUMENT UPLOAD DEBUG ===');
            \Log::info('Client document uploadAndParse method called', [
                'user_authenticated' => auth()->check(),
                'user_id' => auth()->id(),
                'user_role' => auth()->user()?->role,
                'user_email' => auth()->user()?->email,
                'request_data' => $request->all()
            ]);

            $validator = Validator::make($request->all(), [
                'event_id' => 'required|exists:events,id',
                'document' => 'required|file|mimes:pdf|max:10240', // 10MB max
                'document_type' => 'required|in:pdf,email,note',
            ]);

            if ($validator->fails()) {
                \Log::warning('Client document upload validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $event = Event::findOrFail($request->event_id);
            $user = auth()->user();
            
            \Log::info('Event found for client document upload', [
                'event_id' => $event->id,
                'event_name' => $event->name,
                'event_client_email' => $event->client_email,
                'user_email' => $user->email,
                'user_role' => $user->role
            ]);
            
            // Check if client is invited to this event
            $invitation = \App\Models\Invitation::where('event_id', $event->id)
                                              ->where('client_email', $user->email)
                                              ->where('status', 'accepted')
                                              ->first();

            if (!$invitation) {
                \Log::warning('Client not invited to event for document upload', [
                    'event_id' => $event->id,
                    'client_email' => $user->email,
                    'available_invitations' => \App\Models\Invitation::where('event_id', $event->id)
                                                                     ->where('client_email', $user->email)
                                                                     ->get(['id', 'status', 'client_email'])
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this event'
                ], 403);
            }

            \Log::info('Client invitation verified for document upload', [
                'invitation_id' => $invitation->id,
                'invitation_status' => $invitation->status
            ]);

            $file = $request->file('document');
            $originalFilename = $file->getClientOriginalName();
            $fileSize = $file->getSize();
            $mimeType = $file->getMimeType();

            \Log::info('File details for client upload', [
                'original_filename' => $originalFilename,
                'file_size' => $fileSize,
                'mime_type' => $mimeType
            ]);

            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.pdf';
            $filePath = 'event-documents/' . $event->id . '/' . $filename;

            // Upload to S3
            $s3Path = Storage::disk('s3')->put($filePath, $file, 'public');

            if (!$s3Path) {
                throw new Exception('Failed to upload file to S3');
            }

            \Log::info('File uploaded to S3 for client', [
                's3_path' => $s3Path,
                'file_path' => $filePath
            ]);

            // Parse PDF content
            $pdfContent = $this->parsePdfContent($file->getPathname());

            \Log::info('PDF parsed for client', [
                'content_length' => strlen($pdfContent),
                'content_preview' => substr($pdfContent, 0, 200) . '...'
            ]);

            // Analyze with OpenAI
            $aiAnalysis = $this->analyzeContentWithOpenAI($pdfContent);

            \Log::info('AI analysis completed for client', [
                'extracted_fields_count' => count($aiAnalysis['extracted_fields'] ?? [])
            ]);

            // Store document record
            $document = EventDocument::create([
                'event_id' => $event->id,
                'original_filename' => $originalFilename,
                'file_path' => $s3Path,
                'file_size' => (string) $fileSize,
                'mime_type' => $mimeType,
                'document_type' => $request->document_type,
                'parsed_data' => $aiAnalysis,
                'is_processed' => true,
                'uploaded_by' => $user->id
            ]);

            \Log::info('Document record created for client', [
                'document_id' => $document->id,
                'event_id' => $event->id
            ]);

            \Log::info('=== END CLIENT DOCUMENT UPLOAD DEBUG ===');

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded and parsed successfully',
                'data' => [
                    'document' => $document,
                    'parsed_data' => $aiAnalysis,
                    's3_url' => Storage::disk('s3')->url($filePath)
                ]
            ]);

        } catch (Exception $e) {
            \Log::error('Error in client document upload', [
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
     * Test UTF-8 encoding handling
     */
    public function testUtf8Encoding(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'test_content' => 'required|string|max:5000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $testContent = $request->input('test_content');
            
            Log::info('UTF-8 test initiated', [
                'original_length' => strlen($testContent),
                'original_is_valid_utf8' => mb_check_encoding($testContent, 'UTF-8'),
                'original_preview' => substr($testContent, 0, 100)
            ]);

            // Clean the content
            $cleanedContent = $this->cleanUtf8Text($testContent);
            
            // Test JSON encoding
            $testPayload = [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => 'Test system prompt'],
                    ['role' => 'user', 'content' => $cleanedContent]
                ]
            ];
            
            $jsonResult = json_encode($testPayload);
            $jsonSuccess = $jsonResult !== false;
            
            Log::info('UTF-8 test completed', [
                'cleaned_length' => strlen($cleanedContent),
                'cleaned_is_valid_utf8' => mb_check_encoding($cleanedContent, 'UTF-8'),
                'json_encode_success' => $jsonSuccess,
                'json_error' => $jsonSuccess ? null : json_last_error_msg()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'UTF-8 encoding test completed',
                'data' => [
                    'original_length' => strlen($testContent),
                    'original_is_valid_utf8' => mb_check_encoding($testContent, 'UTF-8'),
                    'cleaned_length' => strlen($cleanedContent),
                    'cleaned_is_valid_utf8' => mb_check_encoding($cleanedContent, 'UTF-8'),
                    'json_encode_success' => $jsonSuccess,
                    'json_error' => $jsonSuccess ? null : json_last_error_msg(),
                    'cleaned_preview' => substr($cleanedContent, 0, 200)
                ]
            ]);

        } catch (Exception $e) {
            Log::error('UTF-8 test error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'UTF-8 test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Parse notes for client users
     */
    public function parseNotesForClient(Request $request): JsonResponse
    {
        try {
            \Log::info('=== CLIENT NOTES PARSE DEBUG ===');
            \Log::info('Client notes parse method called', [
                'user_authenticated' => auth()->check(),
                'user_id' => auth()->id(),
                'user_role' => auth()->user()?->role,
                'user_email' => auth()->user()?->email,
                'request_data' => $request->all()
            ]);

            $validator = Validator::make($request->all(), [
                'event_id' => 'required|exists:events,id',
                'notes' => 'required|string|max:10000',
            ]);

            if ($validator->fails()) {
                \Log::warning('Client notes parse validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $event = Event::findOrFail($request->event_id);
            $user = auth()->user();
            
            \Log::info('Event found for client notes parse', [
                'event_id' => $event->id,
                'event_name' => $event->name,
                'event_client_email' => $event->client_email,
                'user_email' => $user->email,
                'user_role' => $user->role
            ]);
            
            // Check if client is invited to this event
            $invitation = \App\Models\Invitation::where('event_id', $event->id)
                                              ->where('client_email', $user->email)
                                              ->where('status', 'accepted')
                                              ->first();

            if (!$invitation) {
                \Log::warning('Client not invited to event for notes parse', [
                    'event_id' => $event->id,
                    'client_email' => $user->email,
                    'available_invitations' => \App\Models\Invitation::where('event_id', $event->id)
                                                                     ->where('client_email', $user->email)
                                                                     ->get(['id', 'status', 'client_email'])
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this event'
                ], 403);
            }

            \Log::info('Client invitation verified for notes parse', [
                'invitation_id' => $invitation->id,
                'invitation_status' => $invitation->status
            ]);

            $notes = $request->input('notes');

            \Log::info('Notes received for client parse', [
                'notes_length' => strlen($notes),
                'notes_preview' => substr($notes, 0, 200) . '...'
            ]);

            // Clean the notes content to ensure UTF-8 compliance before OpenAI analysis
            $cleanNotes = $this->cleanUtf8Text($notes);

            \Log::info('Notes cleaned for client parse', [
                'original_length' => strlen($notes),
                'cleaned_length' => strlen($cleanNotes),
                'is_valid_utf8' => mb_check_encoding($cleanNotes, 'UTF-8')
            ]);

            // Analyze notes with OpenAI (same logic as document parsing)
            try {
                $aiAnalysis = $this->analyzeContentWithOpenAI($cleanNotes);

                \Log::info('AI analysis completed for client notes', [
                    'extracted_fields_count' => count($aiAnalysis['extracted_fields'] ?? [])
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Notes parsed successfully',
                    'data' => $aiAnalysis
                ]);

            } catch (Exception $e) {
                \Log::error('OpenAI analysis failed for client notes', [
                    'error' => $e->getMessage(),
                    'notes_length' => strlen($notes)
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to analyze notes with AI',
                    'error' => $e->getMessage()
                ], 500);
            }

        } catch (Exception $e) {
            \Log::error('Error in client notes parse', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to parse notes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
