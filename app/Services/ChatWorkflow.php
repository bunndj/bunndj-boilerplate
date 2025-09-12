<?php

namespace App\Services;

class ChatWorkflow
{
    /**
     * Get all workflow steps with their questions and options
     */
    public static function getSteps(): array
    {
        return [
            1 => [
                'question' => 'Welcome to our planning app! A couple of quick questions to make sure we have the right show',
                'options' => ['OK', 'Hello'],
                'input_type' => 'options',
                'next_step' => 2
            ],
            2 => [
                'question' => "What's your name?",
                'options' => null,
                'input_type' => 'text',
                'next_step' => 3
            ],
            3 => [
                'question' => "Fiance's Name?",
                'options' => null,
                'input_type' => 'text',
                'next_step' => 4
            ],
            4 => [
                'question' => 'Confirm your wedding date',
                'options' => null,
                'input_type' => 'date',
                'next_step' => 5
            ],
            5 => [
                'question' => 'And location',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 6
            ],
            6 => [
                'question' => 'Great! Have you hired a wedding planner to help you?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null // Will be determined by answer
            ],
            7 => [
                'question' => 'Great! Do you have the PDF of the timeline yet?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            8 => [
                'question' => 'Awesome! Please upload that here',
                'options' => ['Upload Timeline'],
                'input_type' => 'upload',
                'next_step' => 99
            ],
            9 => [
                'question' => 'When you get it, upload it here',
                'options' => ['Upload Timeline'],
                'input_type' => 'upload',
                'next_step' => 10
            ],
            10 => [
                'question' => "OK, can I have the wedding planner's contact info?",
                'options' => null,
                'input_type' => 'text',
                'next_step' => 99
            ],
            11 => [
                'question' => "No worries, let's get this party started!",
                'options' => ['OK'],
                'input_type' => 'options',
                'next_step' => 12
            ],
            12 => [
                'question' => 'Did you book ceremony audio with us?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            13 => [
                'question' => 'What time is the ceremony?',
                'options' => null,
                'input_type' => 'time',
                'next_step' => 14
            ],
            14 => [
                'question' => 'Location?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 16
            ],
            15 => [
                'question' => 'Bot skips forward',
                'options' => ['OK'],
                'input_type' => 'options',
                'next_step' => 99
            ],
            16 => [
                'question' => 'Are we doing music or mics or both?',
                'options' => ['Just Music', 'Music and Mics'],
                'input_type' => 'options',
                'next_step' => null
            ],
            17 => [
                'question' => 'Can you tell us which songs go with each of these moments?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 18
            ],
            18 => [
                'question' => 'Parents and grandparents entrance',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 19
            ],
            19 => [
                'question' => 'Officiant and Groom',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 20
            ],
            20 => [
                'question' => 'Groomsmen',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 21
            ],
            21 => [
                'question' => 'Bridesmaids',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 22
            ],
            22 => [
                'question' => 'Processional',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 23
            ],
            23 => [
                'question' => 'Any songs during the ceremony.',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            24 => [
                'question' => 'What song and when?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 26
            ],
            25 => [
                'question' => "What's your recessional song?",
                'options' => null,
                'input_type' => 'text',
                'next_step' => 26
            ],
            26 => [
                'question' => "You're doing great. Let's move on",
                'options' => ['OK'],
                'input_type' => 'options',
                'next_step' => 27
            ],
            27 => [
                'question' => 'Are we doing the music for cocktail hour?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            28 => [
                'question' => 'Where is it located?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 29
            ],
            29 => [
                'question' => 'Do you have a Spotify link for what you want during this time?',
                'options' => ['Yes', 'No, we will let you pick!'],
                'input_type' => 'options',
                'next_step' => null
            ],
            30 => [
                'question' => 'Great! Post that here',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 31
            ],
            31 => [
                'question' => "Let's move on to the reception",
                'options' => ['OK'],
                'input_type' => 'options',
                'next_step' => 32
            ],
            32 => [
                'question' => 'Are you doing grand introductions?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            33 => [
                'question' => 'Just you two or a group?',
                'options' => ['Just us', 'Group'],
                'input_type' => 'options',
                'next_step' => null
            ],
            34 => [
                'question' => 'Tell me exactly how you want to be introduced',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 35
            ],
            35 => [
                'question' => 'What song should we use?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 36
            ],
            36 => [
                'question' => 'Love it. Let\'s keep going!',
                'options' => ['OK'],
                'input_type' => 'options',
                'next_step' => 37
            ],
            37 => [
                'question' => 'Are you going right into your first dance? We recommend it.',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            38 => [
                'question' => 'Perfect, What\'s the song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 39
            ],
            39 => [
                'question' => 'Play the full song?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            40 => [
                'question' => 'Fade it where?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 47
            ],
            41 => [
                'question' => 'OK, so what\'s next?',
                'options' => ['Welcome', 'Just sit down and eat'],
                'input_type' => 'options',
                'next_step' => null
            ],
            42 => [
                'question' => 'Who\'s going to be doing this?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 43
            ],
            43 => [
                'question' => 'Anyone doing a blessing?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            44 => [
                'question' => 'Who?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 99
            ],
            45 => [
                'question' => 'Please list out the names (we recommend just first names) in the correct order here (bonus points if you phonetically spell out the tough ones)',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 46
            ],
            46 => [
                'question' => 'What song or songs should we use?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 36
            ],
            47 => [
                'question' => 'Are you doing any parent dances after the first dance?',
                'options' => ['Yes', 'No', 'After Dinner'],
                'input_type' => 'options',
                'next_step' => null
            ],
            48 => [
                'question' => 'Who is doing the first one?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 49
            ],
            49 => [
                'question' => 'Song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 50
            ],
            50 => [
                'question' => 'Fade or play entirety?',
                'options' => ['Play it all', 'Fade'],
                'input_type' => 'options',
                'next_step' => null
            ],
            51 => [
                'question' => 'At what point?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 52
            ],
            52 => [
                'question' => 'Who is doing the second dance?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 53
            ],
            53 => [
                'question' => 'Song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 64
            ],
            54 => [
                'question' => 'Play the whole song or fade it?',
                'options' => ['Fade', 'Play it all'],
                'input_type' => 'options',
                'next_step' => null
            ],
            55 => [
                'question' => 'At what point?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 56
            ],
            56 => [
                'question' => 'is anyone doing a welcome next?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            57 => [
                'question' => 'Who?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 58
            ],
            58 => [
                'question' => 'A blessing?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            59 => [
                'question' => 'Who?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 60
            ],
            60 => [
                'question' => 'Let\'s talk about dinner next',
                'options' => ['OK'],
                'input_type' => 'options',
                'next_step' => 61
            ],
            61 => [
                'question' => 'what style of dinner are you having?',
                'options' => ['Buffet', 'Stations', 'Seated, Plated'],
                'input_type' => 'options',
                'next_step' => 62
            ],
            62 => [
                'question' => 'Do you have a playlist in mind for dinner?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            63 => [
                'question' => 'Nice! Just put the Spotify link here.',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 64
            ],
            64 => [
                'question' => 'What\'s after dinner?',
                'options' => ['Toasts', 'Parent dances'],
                'input_type' => 'options',
                'next_step' => null
            ],
            65 => [
                'question' => 'Who is giving a toast?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 66
            ],
            66 => [
                'question' => 'What\'s after the toasts?',
                'options' => ['Time to dance!', 'Parent dances', 'Cake Cutting'],
                'input_type' => 'options',
                'next_step' => null
            ],
            67 => [
                'question' => 'Let\'s goooo! Paste that Spotify link here. 15 - 20 would be great!',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 68
            ],
            68 => [
                'question' => 'Take requests?',
                'options' => ['Yes, if they work with the flow', 'Definitely Not'],
                'input_type' => 'options',
                'next_step' => 69
            ],
            69 => [
                'question' => 'Thoughts on line dances? e.g. Electric Slide, The Wobble, Cupid Suffle',
                'options' => ['If requested', 'Pass'],
                'input_type' => 'options',
                'next_step' => 70
            ],
            70 => [
                'question' => 'Any songs or artists you can\'t stand?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            71 => [
                'question' => 'List them here please',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 86
            ],
            72 => [
                'question' => 'Who is up first?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 73
            ],
            73 => [
                'question' => 'Song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 74
            ],
            74 => [
                'question' => 'Who is second?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 75
            ],
            75 => [
                'question' => 'Song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 86
            ],
            76 => [
                'question' => 'What song are we using here?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 86
            ],
            77 => [
                'question' => 'Who is up first?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 78
            ],
            78 => [
                'question' => 'Song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 79
            ],
            79 => [
                'question' => 'Who is second?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 80
            ],
            80 => [
                'question' => 'Song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 81
            ],
            81 => [
                'question' => 'What\'s after the parent dances?',
                'options' => ['Cake cutting', 'Toasts', 'Dancing'],
                'input_type' => 'options',
                'next_step' => null
            ],
            82 => [
                'question' => 'Who is giving a toast?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 86
            ],
            83 => [
                'question' => 'no problem, we will handle this! Any genres, artists, or vibe you are going for?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 86
            ],
            84 => [
                'question' => 'How about a blessing?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            85 => [
                'question' => 'Who?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 60
            ],
            86 => [
                'question' => 'Are there any other special moments during dancing?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            87 => [
                'question' => 'What are they?',
                'options' => ['Cake cutting', 'Anniversary dance', 'Bouquet toss'],
                'input_type' => 'options',
                'next_step' => null
            ],
            88 => [
                'question' => 'What song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 93
            ],
            89 => [
                'question' => 'What song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 93
            ],
            90 => [
                'question' => 'What song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 91
            ],
            91 => [
                'question' => 'Garter toss?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 92
            ],
            92 => [
                'question' => 'song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 93
            ],
            93 => [
                'question' => 'Do you have a preference for the last song of the night for all of your guests?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            94 => [
                'question' => 'What is it?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 95
            ],
            95 => [
                'question' => 'Are doing any kind of formal exit',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            96 => [
                'question' => 'What type of exit?',
                'options' => ['Sparklers', 'Bubbles', 'Glow sticks', 'Something else'],
                'input_type' => 'options',
                'next_step' => null
            ],
            97 => [
                'question' => 'Are you doing a private last dance? It\'s a great way to end the night as folks trickle out to the exit',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            98 => [
                'question' => 'What\'s that song?',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 99
            ],
            99 => [
                'question' => 'This was fun! I think we have all of the info we need. Let\'s do one final planning call 1-2 weeks before the wedding. Grab a time here',
                'options' => ['Done'],
                'input_type' => 'options',
                'next_step' => null
            ],
            100 => [
                'question' => 'Great! We always mic the officiant. Does the groom need one? We recommend this if you are reading vows to each other.',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            101 => [
                'question' => 'Ok, easy. Any readers or singers?',
                'options' => ['Yes', 'No'],
                'input_type' => 'options',
                'next_step' => null
            ],
            102 => [
                'question' => 'Ok, we will bring a handheld mic and stand for them.',
                'options' => ['OK'],
                'input_type' => 'options',
                'next_step' => 103
            ],
            103 => [
                'question' => 'We will need a Spotify link or mp3 of the exact song and version they are singing.',
                'options' => null,
                'input_type' => 'text',
                'next_step' => 17
            ],
        ];
    }

    /**
     * Get step data by step number
     */
    public static function getStepData(int $step): array
    {
        $steps = self::getSteps();
        return $steps[$step] ?? [];
    }

    /**
     * Get next step based on current step and answer
     */
    public static function getNextStep(int $currentStep, string $answer): int
    {
        $stepData = self::getStepData($currentStep);
        
        // If step has a fixed next step, use it
        if ($stepData['next_step']) {
            return $stepData['next_step'];
        }

        // Handle conditional logic based on current step and answer
        switch ($currentStep) {
            case 6: // Wedding planner question
                return $answer === 'Yes' ? 7 : 11;
            
            case 7: // Timeline PDF question
                return $answer === 'Yes' ? 8 : 9;
            
            case 9: // Upload timeline
                return 10;
            
            case 12: // Ceremony audio question
                return $answer === 'Yes' ? 13 : 15;
            
            case 15: // Bot skips forward
                return $answer === 'OK' ? 99 : 99;
            
            case 16: // Music or mics question
                return $answer === 'Just Music' ? 17 : 100;
            
            case 23: // Songs during ceremony
                return $answer === 'Yes' ? 24 : 25;
            
            case 26: // You're doing great. Let's move on
                return $answer === 'OK' ? 27 : 27;
            
            case 27: // Cocktail hour music
                return $answer === 'Yes' ? 28 : 99;
            
            case 29: // Spotify link for cocktail hour
                return $answer === 'Yes' ? 30 : 31;
            
            case 31: // Let's move on to the reception
                return $answer === 'OK' ? 32 : 32;
            
            case 32: // Grand introductions
                return $answer === 'Yes' ? 33 : 99;
            
            case 33: // Just us or group
                return $answer === 'Just us' ? 34 : 45;
            
            case 36: // Love it. Let's keep going!
                return $answer === 'OK' ? 37 : 37;
            
            case 37: // First dance
                return $answer === 'Yes' ? 38 : 41;
            
            case 39: // Play full song
                return $answer === 'Yes' ? 99 : 40;
            
            case 41: // What's next after first dance
                return $answer === 'Welcome' ? 42 : 60;
            
            case 43: // Blessing question
                return $answer === 'Yes' ? 44 : 99;
            
            case 47: // Parent dances
                if ($answer === 'Yes') return 48;
                if ($answer === 'No') return 56;
                return 56; // After Dinner
            
            case 50: // Fade or play entirety
                return $answer === 'Play it all' ? 56 : 51;
            
            case 54: // Play whole song or fade
                return $answer === 'Play it all' ? 56 : 55;
            
            case 56: // Welcome next
                return $answer === 'Yes' ? 57 : 84;
            
            case 58: // Blessing after welcome
                return $answer === 'Yes' ? 59 : 60;
            
            case 60: // Let's talk about dinner next
                return $answer === 'OK' ? 61 : 61;
            
            case 62: // Dinner playlist
                return $answer === 'Yes' ? 63 : 83;
            
            case 64: // What's after dinner
                return $answer === 'Toasts' ? 65 : 77;
            
            case 66: // What's after toasts
                if ($answer === 'Time to dance!') return 67;
                if ($answer === 'Parent dances') return 72;
                return 76; // Cake Cutting
            
            case 69: // Line dances
                return $answer === 'If requested' ? 70 : 86;
            
            case 70: // Songs you can't stand
                return $answer === 'Yes' ? 71 : 86;
            
            case 81: // What's after parent dances
                if ($answer === 'Cake cutting') return 76;
                if ($answer === 'Toasts') return 82;
                return 67; // Dancing
            
            case 84: // Blessing question
                return $answer === 'Yes' ? 85 : 60;
            
            case 86: // Special moments during dancing
                return $answer === 'Yes' ? 87 : 93;
            
            case 87: // What special moments
                if ($answer === 'Cake cutting') return 88;
                if ($answer === 'Anniversary dance') return 89;
                return 90; // Bouquet toss
            
            case 93: // Last song preference
                return $answer === 'Yes' ? 94 : 95;
            
            case 95: // Formal exit
                return $answer === 'Yes' ? 96 : 97;
            
            case 96: // Exit type
                if (in_array($answer, ['Sparklers', 'Bubbles', 'Glow sticks'])) return 99;
                return 97; // Something else
            
            case 97: // Private last dance
                return $answer === 'Yes' ? 98 : 99;
            
            case 100: // Groom mic question
                return $answer === 'Yes' ? 101 : 17;
            
            case 101: // Readers or singers
                return $answer === 'Yes' ? 102 : 17;
            
            case 102: // Ok, we will bring a handheld mic and stand for them.
                return $answer === 'OK' ? 103 : 103;
            
            default:
                return $currentStep + 1;
        }
    }

    /**
     * Map answers to form fields for event planning
     */
    public static function mapAnswerToPlanningField(int $step, string $answer): array
    {
        $mapping = [
            2 => ['field_name' => 'client_name', 'field_value' => $answer],
            3 => ['field_name' => 'fiance_name', 'field_value' => $answer],
            4 => ['field_name' => 'wedding_date', 'field_value' => $answer],
            5 => ['field_name' => 'wedding_location', 'field_value' => $answer],
            10 => ['field_name' => 'wedding_planner_contact', 'field_value' => $answer],
            13 => ['field_name' => 'ceremony_time', 'field_value' => $answer],
            14 => ['field_name' => 'ceremony_location', 'field_value' => $answer],
            18 => ['field_name' => 'parents_grandparents_entrance_song', 'field_value' => $answer],
            19 => ['field_name' => 'officiant_groom_song', 'field_value' => $answer],
            20 => ['field_name' => 'groomsmen_song', 'field_value' => $answer],
            21 => ['field_name' => 'bridesmaids_song', 'field_value' => $answer],
            22 => ['field_name' => 'processional_song', 'field_value' => $answer],
            24 => ['field_name' => 'ceremony_songs', 'field_value' => $answer],
            25 => ['field_name' => 'recessional_song', 'field_value' => $answer],
            28 => ['field_name' => 'cocktail_hour_location', 'field_value' => $answer],
            30 => ['field_name' => 'cocktail_hour_spotify', 'field_value' => $answer],
            34 => ['field_name' => 'introduction_text', 'field_value' => $answer],
            35 => ['field_name' => 'introduction_song', 'field_value' => $answer],
            38 => ['field_name' => 'first_dance_song', 'field_value' => $answer],
            40 => ['field_name' => 'first_dance_fade_point', 'field_value' => $answer],
            42 => ['field_name' => 'welcome_speaker', 'field_value' => $answer],
            44 => ['field_name' => 'blessing_speaker', 'field_value' => $answer],
            45 => ['field_name' => 'group_introduction_order', 'field_value' => $answer],
            46 => ['field_name' => 'group_introduction_song', 'field_value' => $answer],
            48 => ['field_name' => 'first_parent_dance_person', 'field_value' => $answer],
            49 => ['field_name' => 'first_parent_dance_song', 'field_value' => $answer],
            51 => ['field_name' => 'first_parent_dance_fade_point', 'field_value' => $answer],
            52 => ['field_name' => 'second_parent_dance_person', 'field_value' => $answer],
            53 => ['field_name' => 'second_parent_dance_song', 'field_value' => $answer],
            55 => ['field_name' => 'second_parent_dance_fade_point', 'field_value' => $answer],
            57 => ['field_name' => 'welcome_speaker_name', 'field_value' => $answer],
            59 => ['field_name' => 'blessing_speaker_name', 'field_value' => $answer],
            63 => ['field_name' => 'dinner_playlist_spotify', 'field_value' => $answer],
            65 => ['field_name' => 'toast_speakers', 'field_value' => $answer],
            67 => ['field_name' => 'dancing_playlist_spotify', 'field_value' => $answer],
            71 => ['field_name' => 'do_not_play_songs', 'field_value' => $answer],
            72 => ['field_name' => 'first_parent_dance_person', 'field_value' => $answer],
            73 => ['field_name' => 'first_parent_dance_song', 'field_value' => $answer],
            74 => ['field_name' => 'second_parent_dance_person', 'field_value' => $answer],
            75 => ['field_name' => 'second_parent_dance_song', 'field_value' => $answer],
            76 => ['field_name' => 'cake_cutting_song', 'field_value' => $answer],
            78 => ['field_name' => 'first_parent_dance_person', 'field_value' => $answer],
            79 => ['field_name' => 'first_parent_dance_song', 'field_value' => $answer],
            80 => ['field_name' => 'second_parent_dance_person', 'field_value' => $answer],
            81 => ['field_name' => 'second_parent_dance_song', 'field_value' => $answer],
            82 => ['field_name' => 'toast_speakers', 'field_value' => $answer],
            83 => ['field_name' => 'dinner_music_preferences', 'field_value' => $answer],
            85 => ['field_name' => 'blessing_speaker_name', 'field_value' => $answer],
            88 => ['field_name' => 'cake_cutting_song', 'field_value' => $answer],
            89 => ['field_name' => 'anniversary_dance_song', 'field_value' => $answer],
            90 => ['field_name' => 'bouquet_toss_song', 'field_value' => $answer],
            91 => ['field_name' => 'garter_toss_song', 'field_value' => $answer],
            94 => ['field_name' => 'last_song_preference', 'field_value' => $answer],
            98 => ['field_name' => 'private_last_dance_song', 'field_value' => $answer],
            103 => ['field_name' => 'readers_singers_song', 'field_value' => $answer],
        ];

        return $mapping[$step] ?? [];
    }

    /**
     * Map answers to music ideas
     */
    public static function mapAnswerToMusicIdeas(int $step, string $answer): array
    {
        $mapping = [
            18 => ['category' => 'ceremony', 'type' => 'parents_grandparents_entrance', 'value' => $answer],
            19 => ['category' => 'ceremony', 'type' => 'officiant_groom', 'value' => $answer],
            20 => ['category' => 'ceremony', 'type' => 'groomsmen', 'value' => $answer],
            21 => ['category' => 'ceremony', 'type' => 'bridesmaids', 'value' => $answer],
            22 => ['category' => 'ceremony', 'type' => 'processional', 'value' => $answer],
            24 => ['category' => 'ceremony', 'type' => 'during_ceremony', 'value' => $answer],
            25 => ['category' => 'ceremony', 'type' => 'recessional', 'value' => $answer],
            30 => ['category' => 'cocktail_hour', 'type' => 'spotify_playlist', 'value' => $answer],
            35 => ['category' => 'reception', 'type' => 'introduction', 'value' => $answer],
            38 => ['category' => 'reception', 'type' => 'first_dance', 'value' => $answer],
            46 => ['category' => 'reception', 'type' => 'group_introduction', 'value' => $answer],
            49 => ['category' => 'reception', 'type' => 'first_parent_dance', 'value' => $answer],
            53 => ['category' => 'reception', 'type' => 'second_parent_dance', 'value' => $answer],
            63 => ['category' => 'reception', 'type' => 'dinner_playlist', 'value' => $answer],
            67 => ['category' => 'reception', 'type' => 'dancing_playlist', 'value' => $answer],
            71 => ['category' => 'preferences', 'type' => 'do_not_play', 'value' => $answer],
            76 => ['category' => 'reception', 'type' => 'cake_cutting', 'value' => $answer],
            88 => ['category' => 'reception', 'type' => 'cake_cutting', 'value' => $answer],
            89 => ['category' => 'reception', 'type' => 'anniversary_dance', 'value' => $answer],
            90 => ['category' => 'reception', 'type' => 'bouquet_toss', 'value' => $answer],
            91 => ['category' => 'reception', 'type' => 'garter_toss', 'value' => $answer],
            94 => ['category' => 'reception', 'type' => 'last_song', 'value' => $answer],
            98 => ['category' => 'reception', 'type' => 'private_last_dance', 'value' => $answer],
        ];

        return $mapping[$step] ?? [];
    }
}
