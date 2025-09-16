<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventChatProgress;
use App\Models\EventPlanning;
use App\Models\EventMusicIdeas;
use App\Models\EventTimeline;
use App\Services\ChatWorkflow;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatProgressController extends Controller
{
    /**
     * Get or create chat progress for an event
     */
    public function show(Event $event): JsonResponse
    {
        $user = auth()->user();
        
        $chatProgress = EventChatProgress::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$chatProgress) {
            // Create new chat progress
            $chatProgress = EventChatProgress::create([
                'event_id' => $event->id,
                'user_id' => $user->id,
                'current_step' => 1,
                'answers' => [],
                'chat_messages' => [],
                'is_completed' => false,
                'last_activity_at' => now(),
            ]);
        }

        $currentStepData = ChatWorkflow::getStepData($chatProgress->current_step);
        
        
        // Add the first message if no messages exist
        if (empty($chatProgress->chat_messages) && $currentStepData) {
            $chatProgress->addMessage($currentStepData['question'], true, $currentStepData['options'] ?? []);
            $chatProgress->save();
        }
        
        // Add step 99 message if user is at step 99 and not completed
        if ($chatProgress->current_step == 99 && !$chatProgress->is_completed && $currentStepData) {
            // Check if step 99 message already exists (without calendar link)
            $hasStep99Message = false;
            if ($chatProgress->chat_messages) {
                foreach ($chatProgress->chat_messages as $msg) {
                    if (strpos($msg['text'], 'This was fun! I think we have all of the info we need') !== false) {
                        $hasStep99Message = true;
                        break;
                    }
                }
            }
            
            // Add step 99 message only if it doesn't exist (without calendar link)
            if (!$hasStep99Message) {
                $originalQuestion = ChatWorkflow::getStepData(99)['question'];
                $chatProgress->addMessage($originalQuestion, true, $currentStepData['options'] ?? []);
                $chatProgress->save();
            }
        }
        
        return response()->json([
            'chat_progress' => $chatProgress,
            'current_step_data' => $currentStepData,
            'is_completed' => $chatProgress->isCompleted(),
            'dj_calendar_link' => $event->dj ? $event->dj->calendar_link : null,
        ]);
    }

    /**
     * Save answer and move to next step
     */
    public function store(Request $request, Event $event): JsonResponse
    {
        $user = auth()->user();
        $answer = $request->input('answer');
        $step = $request->input('step');

        $chatProgress = EventChatProgress::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$chatProgress) {
            return response()->json(['error' => 'Chat progress not found'], 404);
        }

        // Save the answer
        $chatProgress->setAnswer($step, $answer);
        
        // Add user message to chat
        $chatProgress->addMessage($answer, false);
        
        // Get next step
        $nextStep = ChatWorkflow::getNextStep($step, $answer);
        $chatProgress->current_step = $nextStep;
        $chatProgress->last_activity_at = now();
        
        // Check if completed - if user clicked "Done" on step 99
        if ($step == 99 && $answer === 'Done') {
            \Log::info('🔵 [CHAT-DONE] Processing Done button at step ' . $step);
            \Log::info('🔵 [CHAT-DONE] Marking chat as completed for Event ID: ' . $event->id);
            
            $chatProgress->is_completed = true;
            $chatProgress->current_step = 99; // Keep at step 99
        }
        
        $chatProgress->save();

        // Only map answer to form fields if chat is completed (Done button clicked)
        if ($chatProgress->is_completed) {
            \Log::info('🔵 [CHAT-DONE] Chat completed, starting form filling process');
            $this->mapAllAnswersToForms($event, $chatProgress);
            \Log::info('🟢 [CHAT-DONE] Done button processing complete');
        }

        // Get next step data
        $nextStepData = ChatWorkflow::getStepData($nextStep);
        
        // Add bot response
        if ($nextStepData) {
            $chatProgress->addMessage($nextStepData['question'], true, $nextStepData['options'] ?? []);
            $chatProgress->save();
        }

        return response()->json([
            'chat_progress' => $chatProgress,
            'next_step_data' => $nextStepData,
            'is_completed' => $chatProgress->isCompleted(),
            'dj_calendar_link' => $event->dj ? $event->dj->calendar_link : null,
        ]);
    }

    /**
     * Reset chat progress
     */
    public function reset(Event $event): JsonResponse
    {
        $user = auth()->user();
        
        EventChatProgress::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json(['message' => 'Chat progress reset successfully']);
    }

    /**
     * Map all answers to forms using AI parsing
     */
    private function mapAllAnswersToForms(Event $event, EventChatProgress $chatProgress): void
    {
        \Log::info('🔵 [CHAT-FORM] === STARTING CHAT TO FORMS MAPPING ===');
        \Log::info('🔵 [CHAT-FORM] Event ID: ' . $event->id);
        \Log::info('🔵 [CHAT-FORM] Chat Progress ID: ' . $chatProgress->id);
        
        // Get all chat messages for AI parsing
        $chatMessages = $chatProgress->chat_messages ?? [];
        $answers = $chatProgress->answers ?? [];
        
        \Log::info('🔵 [CHAT-FORM] Chat data overview:', [
            'messages_count' => count($chatMessages),
            'answers_count' => count($answers),
            'current_step' => $chatProgress->current_step,
            'is_completed' => $chatProgress->isCompleted()
        ]);
        
        // Create conversation context for AI
        $conversationContext = $this->buildConversationContext($chatMessages, $answers);
        \Log::info('🔵 [CHAT-FORM] Conversation context built (length: ' . strlen($conversationContext) . ' chars)');
        
        // Use AI to parse and extract structured data
        $parsedData = $this->parseChatWithAI($conversationContext, $chatProgress);
        \Log::info('🟢 [CHAT-FORM] AI parsing completed');
        
        // Map parsed data to forms
        $this->mapParsedDataToForms($event, $parsedData);
        \Log::info('🟢 [CHAT-FORM] === CHAT TO FORMS MAPPING COMPLETE ===');
    }

    /**
     * Build conversation context for AI parsing
     */
    private function buildConversationContext(array $chatMessages, array $answers): string
    {
        $context = "Wedding Planning Chat Conversation:\n\n";
        
        foreach ($chatMessages as $message) {
            if ($message['is_bot']) {
                $context .= "Bot: " . $message['text'] . "\n";
            } else {
                $context .= "User: " . $message['text'] . "\n";
            }
        }
        
        $context .= "\nUser Answers Summary:\n";
        foreach ($answers as $step => $answer) {
            $stepData = ChatWorkflow::getStepData($step);
            if ($stepData) {
                $context .= "Step {$step} ({$stepData['question']}): {$answer}\n";
            }
        }
        
        return $context;
    }

    /**
     * Parse chat conversation with AI to extract structured data
     */
    private function parseChatWithAI(string $conversationContext, EventChatProgress $chatProgress): array
    {
        \Log::info('🔵 [AI-PARSE] Starting AI parsing of chat conversation');
        \Log::info('🔵 [AI-PARSE] Context length: ' . strlen($conversationContext) . ' characters');
        
        try {
            // Try to use OpenAI to parse the conversation
            $openaiApiKey = config('services.openai.api_key');
            
            if (!$openaiApiKey) {
                \Log::warning('🟡 [AI-PARSE] OpenAI API key not configured, using fallback mapping');
                return $this->fallbackChatParsing($chatProgress);
            }

            \Log::info('🔵 [AI-PARSE] Using OpenAI to parse chat conversation');
            
            $systemPrompt = $this->getChatAnalysisSystemPrompt();
            $userPrompt = $this->getChatAnalysisUserPrompt($conversationContext);
            
            $response = \Http::timeout(30)
                ->connectTimeout(10)
                ->retry(2, 1000)
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
                
                \Log::info('🟢 [AI-PARSE] OpenAI response received, parsing data');
                
                // Parse the AI response into structured data
                $parsedData = $this->parseAIChatResponse($aiResponse);
                
                \Log::info('🟢 [AI-PARSE] AI parsing complete:', [
                    'planning_fields_count' => count($parsedData['planning_data'] ?? []),
                    'music_categories_count' => count($parsedData['music_data'] ?? []),
                    'timeline_items_count' => count($parsedData['timeline_data']['timeline_items'] ?? [])
                ]);
                
                return $parsedData;
            } else {
                \Log::error('🔴 [AI-PARSE] OpenAI API failed, using fallback', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return $this->fallbackChatParsing($chatProgress);
            }
            
        } catch (\Exception $e) {
            \Log::error('🔴 [AI-PARSE] Exception during OpenAI call, using fallback', [
                'error' => $e->getMessage()
            ]);
            return $this->fallbackChatParsing($chatProgress);
        }
    }
    
    /**
     * Fallback parsing when AI is not available
     */
    private function fallbackChatParsing(EventChatProgress $chatProgress): array
    {
        \Log::info('🔵 [AI-PARSE] Using fallback mapping logic (direct answer mapping)');
        
        $planningData = $this->extractPlanningDataFromAnswers($chatProgress);
        $musicData = $this->extractMusicDataFromAnswers($chatProgress);
        $timelineData = $this->extractTimelineDataFromAnswers($chatProgress);
        
        \Log::info('🟢 [AI-PARSE] Fallback extraction complete:', [
            'planning_fields_count' => count($planningData),
            'music_categories_count' => count($musicData),
            'timeline_items_count' => isset($timelineData['timeline_items']) ? count($timelineData['timeline_items']) : 0
        ]);
        
        return [
            'planning_data' => $planningData,
            'music_data' => $musicData,
            'timeline_data' => $timelineData
        ];
    }
    
    /**
     * Get system prompt for chat analysis
     */
    private function getChatAnalysisSystemPrompt(): string
    {
        return "You are an AI assistant specialized in analyzing wedding planning chat conversations and extracting structured data for event planning forms.

Your task is to analyze a conversation between a bot and a user about wedding planning details and extract the relevant information into three categories:

1. PLANNING DATA: Basic event information like names, dates, locations, guest counts, ceremony details, etc.
2. MUSIC DATA: Songs mentioned for different parts of the event (ceremony, reception, first dance, etc.)
3. TIMELINE DATA: Any timeline items or schedule information mentioned

Return your response in this exact JSON format:
{
  \"planning_data\": {
    \"mailingAddress\": \"extracted mailing address\",
    \"guestCount\": \"extracted number as integer\",
    \"coordinatorEmail\": \"extracted coordinator email\",
    \"photographerEmail\": \"extracted photographer email\",
    \"videographerEmail\": \"extracted videographer email\",
    \"isWedding\": true,
    \"ceremonyCeremonyAudio\": false,
    \"ceremonyStartTime\": \"extracted ceremony start time (HH:MM format)\",
    \"ceremonyLocation\": \"extracted ceremony location\",
    \"officiantName\": \"extracted officiant name\",
    \"providingCeremonyMusic\": true,
    \"guestArrivalMusic\": \"extracted prelude/arrival music\",
    \"ceremonyNotes\": \"extracted ceremony notes\",
    \"providingCeremonyMicrophones\": false,
    \"whoNeedsMic\": \"extracted who needs microphones\",
    \"ceremonyDjNotes\": \"extracted DJ ceremony notes\",
    \"uplighting\": false,
    \"photoBooth\": false,
    \"cocktailHourMusic\": false,
    \"cocktailHourLocation\": \"extracted cocktail hour location\",
    \"cocktailMusic\": \"extracted cocktail hour music details\",
    \"cocktailNotes\": \"extracted cocktail hour notes\",
    \"introductionsTime\": \"extracted introductions time (HH:MM format)\",
    \"parentsEntranceSong\": \"extracted parents entrance song\",
    \"weddingPartyIntroSong\": \"extracted wedding party introduction song\",
    \"coupleIntroSong\": \"extracted couple introduction song\",
    \"weddingPartyIntroductions\": \"extracted wedding party introduction details\",
    \"specialDances\": \"extracted special dances (first dance, father-daughter, mother-son, etc.)\",
    \"otherNotes\": \"extracted other planning notes\",
    \"dinnerMusic\": \"extracted dinner music details\",
    \"dinnerStyle\": \"extracted dinner style\",
    \"welcomeBy\": \"extracted welcome speaker name\",
    \"blessingBy\": \"extracted blessing speaker name\",
    \"toasts\": \"extracted toast details\",
    \"receptionNotes\": \"extracted reception notes\",
    \"exitDescription\": \"extracted exit/send-off details\",
    \"otherComments\": \"extracted other comments\",
    \"spotifyPlaylists\": \"extracted Spotify playlist details\",
    \"lineDances\": \"extracted line dance requests\",
    \"takeRequests\": \"extracted music request policy\",
    \"musicNotes\": \"extracted music notes\"
  },
  \"music_data\": {
    \"must_play\": [
      {
        \"song_title\": \"extracted first dance song\",
        \"artist\": \"extracted artist\",
        \"client_visible_title\": \"First Dance\"
      },
      {
        \"song_title\": \"extracted ceremony processional\",
        \"artist\": \"extracted artist\",
        \"client_visible_title\": \"Processional\"
      }
    ],
    \"play_if_possible\": [
      {
        \"song_title\": \"extracted song for cocktail hour\",
        \"artist\": \"extracted artist\",
        \"client_visible_title\": \"Cocktail Hour\"
      }
    ],
    \"dedication\": [
      {
        \"song_title\": \"extracted special dedication song\",
        \"artist\": \"extracted artist\",
        \"client_visible_title\": \"Special Dedication\"
      }
    ],
    \"play_only_if_requested\": [],
    \"do_not_play\": [],
    \"guest_request\": []
  },
  \"timeline_data\": {
    \"timeline_items\": [
      {
        \"id\": \"ceremony-time\",
        \"name\": \"Ceremony\",
        \"start_time\": \"extracted ceremony start time\",
        \"end_time\": \"extracted ceremony end time\",
        \"notes\": \"Wedding ceremony\",
        \"time_offset\": 0,
        \"order\": 0
      }
    ]
  }
}

Extract only the information that is clearly mentioned in the conversation. Use empty strings for missing information. Be thorough but accurate.";
    }
    
    /**
     * Get user prompt for chat analysis
     */
    private function getChatAnalysisUserPrompt(string $conversationContext): string
    {
        return "Please analyze this wedding planning conversation and extract all the relevant information into the structured format:

" . $conversationContext . "

Extract all the wedding planning details mentioned in this conversation and return them in the exact JSON format specified in the system prompt.";
    }
    
    /**
     * Parse AI response for chat data
     */
    private function parseAIChatResponse(string $aiResponse): array
    {
        try {
            // Clean the response to extract just the JSON
            $jsonStart = strpos($aiResponse, '{');
            $jsonEnd = strrpos($aiResponse, '}');
            
            if ($jsonStart !== false && $jsonEnd !== false) {
                $jsonString = substr($aiResponse, $jsonStart, $jsonEnd - $jsonStart + 1);
                $parsed = json_decode($jsonString, true);
                
                if (json_last_error() === JSON_ERROR_NONE) {
                    \Log::info('🟢 [AI-PARSE] Successfully parsed AI JSON response');
                    return $parsed;
                }
            }
            
            \Log::warning('🟡 [AI-PARSE] Failed to parse AI JSON response, trying fallback extraction');
            // If JSON parsing fails, return empty structure
            return [
                'planning_data' => [],
                'music_data' => [],
                'timeline_data' => ['timeline_items' => []]
            ];
            
        } catch (\Exception $e) {
            \Log::error('🔴 [AI-PARSE] Failed to parse AI response: ' . $e->getMessage());
            return [
                'planning_data' => [],
                'music_data' => [],
                'timeline_data' => ['timeline_items' => []]
            ];
        }
    }

    /**
     * Extract planning data from chat answers and map to form structure
     */
    private function extractPlanningDataFromAnswers(EventChatProgress $chatProgress): array
    {
        $answers = $chatProgress->answers ?? [];
        $formData = [];
        
        // Map chat answers to form fields
        foreach ($answers as $step => $answer) {
            $mapping = ChatWorkflow::mapAnswerToPlanningField($step, $answer);
            if ($mapping) {
                $formData[$mapping['field_name']] = $mapping['field_value'];
            }
        }
        
        // Convert to form structure
        $convertedData = $this->convertToFormStructure($formData);
        
        return $convertedData;
    }

    /**
     * Convert raw data to form structure
     */
    private function convertToFormStructure(array $rawData): array
    {
        $formData = [];
        
        // Map raw data to form fields
        $fieldMapping = [
            'client_name' => 'mailingAddress', // This might need adjustment
            'fiance_name' => 'partner_name', // This might need adjustment
            'wedding_date' => 'event_date', // This might need adjustment
            'wedding_location' => 'mailingAddress', // This might need adjustment
            'ceremony_time' => 'ceremonyStartTime',
            'ceremony_location' => 'ceremonyLocation',
            'ceremony_songs' => 'ceremonyNotes',
            'cocktail_hour_location' => 'cocktailHourLocation',
            'cocktail_hour_spotify' => 'cocktailMusic',
            'introduction_text' => 'weddingPartyIntroductions',
            'introduction_song' => 'coupleIntroSong',
            'first_dance_song' => 'specialDances',
            'first_dance_fade_point' => 'musicNotes',
            'welcome_speaker_name' => 'welcomeBy',
            'blessing_speaker_name' => 'blessingBy',
            'dinner_playlist_spotify' => 'dinnerMusic',
            'dinner_style' => 'dinnerStyle',
            'toast_speakers' => 'toasts',
            'bouquet_toss_song' => 'specialDances',
            'garter_toss_song' => 'specialDances',
            'private_last_dance_song' => 'specialDances',
            'parents_grandparents_entrance_song' => 'parentsEntranceSong',
            'officiant_groom_song' => 'guestArrivalMusic',
            'groomsmen_song' => 'weddingPartyIntroSong',
            'bridesmaids_song' => 'weddingPartyIntroSong',
            'processional_song' => 'weddingPartyIntroSong',
            'recessional_song' => 'weddingPartyIntroSong',
            'first_parent_dance_song' => 'specialDances',
            'second_parent_dance_song' => 'specialDances',
            'readers_singers_song' => 'ceremonyDjNotes',
        ];
        
        foreach ($fieldMapping as $rawField => $formField) {
            if (isset($rawData[$rawField])) {
                $formData[$formField] = $rawData[$rawField];
            }
        }
        
        // Set boolean fields based on answers
        if (isset($rawData['ceremony_time']) && !empty($rawData['ceremony_time'])) {
            $formData['ceremonyCeremonyAudio'] = true;
            $formData['providingCeremonyMusic'] = true;
        }
        
        if (isset($rawData['cocktail_hour_spotify']) && !empty($rawData['cocktail_hour_spotify'])) {
            $formData['cocktailHourMusic'] = true;
        }
        
        return $formData;
    }

    /**
     * Extract music data from chat answers and convert to form structure
     */
    private function extractMusicDataFromAnswers(EventChatProgress $chatProgress): array
    {
        $answers = $chatProgress->answers ?? [];
        $rawMusicData = [];
        
        // Process each answer using existing mapping logic
        foreach ($answers as $step => $answer) {
            $mapping = ChatWorkflow::mapAnswerToMusicIdeas($step, $answer);
            if ($mapping) {
                $category = $mapping['category'];
                $type = $mapping['type'];
                
                if (!isset($rawMusicData[$category])) {
                    $rawMusicData[$category] = [];
                }
                
                $rawMusicData[$category][$type] = $mapping['value'];
            }
        }
        
        // Convert to music ideas form structure
        $convertedData = $this->convertToMusicIdeasFormStructure($rawMusicData);
        
        return $convertedData;
    }

    /**
     * Convert raw music data to music ideas form structure
     */
    private function convertToMusicIdeasFormStructure(array $rawMusicData): array
    {
        $formData = [
            'must_play' => [],
            'play_if_possible' => [],
            'dedication' => [],
            'play_only_if_requested' => [],
            'do_not_play' => [],
            'guest_request' => []
        ];
        
        // Map ceremony songs to must_play
        if (isset($rawMusicData['ceremony'])) {
            $ceremonySongs = $rawMusicData['ceremony'];
            foreach ($ceremonySongs as $type => $song) {
                if (!empty($song)) {
                    $formData['must_play'][] = [
                        'song_title' => $song,
                        'artist' => '',
                        'client_visible_title' => $song
                    ];
                }
            }
        }
        
        // Map reception songs to must_play
        if (isset($rawMusicData['reception'])) {
            $receptionSongs = $rawMusicData['reception'];
            foreach ($receptionSongs as $type => $song) {
                if (!empty($song)) {
                    $formData['must_play'][] = [
                        'song_title' => $song,
                        'artist' => '',
                        'client_visible_title' => $song
                    ];
                }
            }
        }
        
        // Map cocktail hour songs to play_if_possible
        if (isset($rawMusicData['cocktail_hour'])) {
            $cocktailSongs = $rawMusicData['cocktail_hour'];
            foreach ($cocktailSongs as $type => $song) {
                if (!empty($song)) {
                    $formData['play_if_possible'][] = [
                        'song_title' => $song,
                        'artist' => '',
                        'client_visible_title' => $song
                    ];
                }
            }
        }
        
        return $formData;
    }

    /**
     * Extract timeline data from chat answers
     */
    private function extractTimelineDataFromAnswers(EventChatProgress $chatProgress): array
    {
        // Timeline data extraction would be implemented here
        // For now, return basic timeline structure
        return [
            'timeline_items' => []
        ];
    }

    /**
     * Map parsed data to all forms
     */
    private function mapParsedDataToForms(Event $event, array $parsedData): void
    {
        \Log::info('🔵 [MERGE] === STARTING DATA MERGE PROCESS ===');
        \Log::info('🔵 [MERGE] Event ID: ' . $event->id);
        
        // Create or update planning data
        if (!empty($parsedData['planning_data'])) {
            \Log::info('🔵 [MERGE] Processing planning data merge');
            
            $planning = $event->planning;
            if (!$planning) {
                \Log::info('🔵 [MERGE] Creating new planning record');
                $planning = EventPlanning::create([
                    'event_id' => $event->id,
                    'planning_data' => [],
                    'notes' => null,
                ]);
            } else {
                \Log::info('🔵 [MERGE] Using existing planning record ID: ' . $planning->id);
            }
            
            // Get existing planning data
            $existingPlanningData = $planning->planning_data ?? [];
            $existingFields = [];
            foreach ($existingPlanningData as $field) {
                if (isset($field['field_name'])) {
                    $existingFields[$field['field_name']] = $field['field_value'];
                }
            }
            
            \Log::info('🔵 [MERGE] Existing planning fields count: ' . count($existingFields));
            \Log::info('🔵 [MERGE] New planning fields count: ' . count($parsedData['planning_data']));
            
            // Merge with new data from chat (only add if field doesn't exist or is empty)
            $mergedPlanningData = $existingFields;
            $addedFields = 0;
            $skippedFields = 0;
            
            foreach ($parsedData['planning_data'] as $fieldName => $fieldValue) {
                // Only add if field doesn't exist or is empty
                if (!isset($mergedPlanningData[$fieldName]) || empty($mergedPlanningData[$fieldName])) {
                    $mergedPlanningData[$fieldName] = $fieldValue;
                    $addedFields++;
                } else {
                    $skippedFields++;
                }
            }
            
            \Log::info('🟢 [MERGE] Planning data merge results:', [
                'existing_fields' => count($existingFields),
                'new_fields_from_chat' => count($parsedData['planning_data']),
                'fields_added' => $addedFields,
                'fields_skipped' => $skippedFields,
                'final_fields_count' => count($mergedPlanningData)
            ]);
            
            // Convert back to array format
            $planningDataArray = [];
            foreach ($mergedPlanningData as $fieldName => $fieldValue) {
                $planningDataArray[] = [
                    'field_name' => $fieldName,
                    'field_value' => $fieldValue
                ];
            }
            
            $planning->planning_data = $planningDataArray;
            $planning->save();
            \Log::info('🟢 [MERGE] Planning data saved to database');
        }

        // Create or update music ideas
        if (!empty($parsedData['music_data'])) {
            \Log::info('🔵 [MERGE] Processing music data merge');
            
            $musicIdeas = $event->musicIdeas;
            if (!$musicIdeas) {
                \Log::info('🔵 [MERGE] Creating new music ideas record');
                $musicIdeas = EventMusicIdeas::create([
                    'event_id' => $event->id,
                    'music_ideas' => [],
                    'notes' => null,
                ]);
            } else {
                \Log::info('🔵 [MERGE] Using existing music ideas record ID: ' . $musicIdeas->id);
            }
            
            // Get existing music data
            $existingMusicData = $musicIdeas->music_ideas ?? [];
            \Log::info('🔵 [MERGE] Existing music categories: ' . count($existingMusicData));
            \Log::info('🔵 [MERGE] New music categories from chat: ' . count($parsedData['music_data']));
            
            // Merge with new data from chat (only add if field doesn't exist or is empty)
            $mergedMusicData = $existingMusicData;
            $categoriesAdded = 0;
            $categoriesSkipped = 0;
            $songsAdded = 0;
            
            foreach ($parsedData['music_data'] as $category => $songs) {
                if (!isset($mergedMusicData[$category]) || empty($mergedMusicData[$category])) {
                    $mergedMusicData[$category] = $songs;
                    $categoriesAdded++;
                    if (is_array($songs)) {
                        $songsAdded += count($songs);
                    }
                } elseif (is_array($songs)) {
                    // If it's an array of songs, merge them
                    $categoryExists = true;
                    foreach ($songs as $songKey => $songValue) {
                        if (!isset($mergedMusicData[$category][$songKey]) || empty($mergedMusicData[$category][$songKey])) {
                            $mergedMusicData[$category][$songKey] = $songValue;
                            $songsAdded++;
                        }
                    }
                    $categoriesSkipped++;
                } else {
                    $categoriesSkipped++;
                }
            }
            
            \Log::info('🟢 [MERGE] Music data merge results:', [
                'existing_categories' => count($existingMusicData),
                'new_categories_from_chat' => count($parsedData['music_data']),
                'categories_added' => $categoriesAdded,
                'categories_skipped' => $categoriesSkipped,
                'songs_added' => $songsAdded,
                'final_categories_count' => count($mergedMusicData)
            ]);
            
            $musicIdeas->music_ideas = $mergedMusicData;
            $musicIdeas->save();
            \Log::info('🟢 [MERGE] Music data saved to database');
        }

        // Create or update timeline data
        if (!empty($parsedData['timeline_data'])) {
            \Log::info('🔵 [MERGE] Processing timeline data merge');
            
            $timeline = $event->timeline;
            if (!$timeline) {
                \Log::info('🔵 [MERGE] Creating new timeline record');
                $timeline = EventTimeline::create([
                    'event_id' => $event->id,
                    'timeline_data' => [],
                ]);
            } else {
                \Log::info('🔵 [MERGE] Using existing timeline record ID: ' . $timeline->id);
            }
            
            // Get existing timeline data
            $existingTimelineData = $timeline->timeline_data ?? [];
            $existingTimelineItems = $existingTimelineData['timeline_items'] ?? [];
            \Log::info('🔵 [MERGE] Existing timeline items: ' . count($existingTimelineItems));
            
            // Merge with new timeline items from chat
            $newTimelineItems = $parsedData['timeline_data']['timeline_items'] ?? [];
            \Log::info('🔵 [MERGE] New timeline items from chat: ' . count($newTimelineItems));
            
            $mergedTimelineItems = array_merge($existingTimelineItems, $newTimelineItems);
            
            \Log::info('🟢 [MERGE] Timeline data merge results:', [
                'existing_items' => count($existingTimelineItems),
                'new_items_from_chat' => count($newTimelineItems),
                'final_items_count' => count($mergedTimelineItems)
            ]);
            
            $timeline->timeline_data = [
                'timeline_items' => $mergedTimelineItems
            ];
            $timeline->save();
            \Log::info('🟢 [MERGE] Timeline data saved to database');
        }
        
        \Log::info('🟢 [MERGE] === DATA MERGE PROCESS COMPLETE ===');
    }

    /**
     * Map answer to appropriate forms (legacy method - now only used for immediate mapping)
     */
    private function mapAnswerToForms(Event $event, int $step, string $answer): void
    {
        // This method is now only used for immediate mapping during chat
        // The main form filling happens in mapAllAnswersToForms after completion
    }

    /**
     * Manually trigger form filling from completed chat
     */
    public function fillFormsFromChat(Event $event): JsonResponse
    {
        $user = auth()->user();
        
        $chatProgress = EventChatProgress::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$chatProgress) {
            return response()->json(['error' => 'Chat progress not found'], 404);
        }

        if (!$chatProgress->isCompleted()) {
            return response()->json(['error' => 'Chat is not completed yet'], 400);
        }

        // Fill forms from chat data
        $this->mapAllAnswersToForms($event, $chatProgress);

        // Refresh the event to get the updated data
        $event->refresh();

        // Convert planning data to form format
        $planningFormData = [];
        if ($event->planning && $event->planning->planning_data) {
            foreach ($event->planning->planning_data as $field) {
                if (isset($field['field_name']) && isset($field['field_value'])) {
                    $planningFormData[$field['field_name']] = $field['field_value'];
                }
            }
        }

        // Convert music data to form format
        $musicFormData = [];
        if ($event->musicIdeas && $event->musicIdeas->music_ideas) {
            $musicFormData = $event->musicIdeas->music_ideas;
        }

        // Convert timeline data to form format
        $timelineFormData = [];
        if ($event->timeline && $event->timeline->timeline_data) {
            $timelineFormData = $event->timeline->timeline_data;
        }

        return response()->json([
            'message' => 'Forms filled successfully from chat data',
            'planning_data' => $planningFormData,
            'music_data' => $musicFormData,
            'timeline_data' => $timelineFormData,
        ]);
    }

    /**
     * Get form data populated from chat
     */
    public function getFormData(Event $event): JsonResponse
    {
        $planningData = $event->planning?->planning_data ?? [];
        $musicData = $event->musicIdeas?->music_ideas ?? [];
        $timelineData = $event->timeline?->timeline_data ?? [];

        return response()->json([
            'planning_data' => $planningData,
            'music_data' => $musicData,
            'timeline_data' => $timelineData,
        ]);
    }
}