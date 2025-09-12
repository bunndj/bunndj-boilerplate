<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventChatProgress extends Model
{
    use HasFactory;

    protected $table = 'event_chat_progress';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'event_id',
        'user_id',
        'current_step',
        'answers',
        'chat_messages',
        'is_completed',
        'last_activity_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'chat_messages' => 'array',
            'is_completed' => 'boolean',
            'last_activity_at' => 'datetime',
        ];
    }

    /**
     * Get the event that owns this chat progress
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the user that owns this chat progress
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get a specific answer by step
     */
    public function getAnswer(int $step): ?string
    {
        return $this->answers[$step] ?? null;
    }

    /**
     * Set an answer for a specific step
     */
    public function setAnswer(int $step, string $answer): void
    {
        $answers = $this->answers ?? [];
        $answers[$step] = $answer;
        $this->answers = $answers;
    }

    /**
     * Add a chat message
     */
    public function addMessage(string $text, bool $isBot = true, ?array $options = []): void
    {
        $messages = $this->chat_messages ?? [];
        $messages[] = [
            'id' => uniqid(),
            'text' => $text,
            'is_bot' => $isBot,
            'options' => $options ?? [],
            'timestamp' => now()->toISOString(),
        ];
        $this->chat_messages = $messages;
    }

    /**
     * Get the current step question and options
     */
    public function getCurrentStepData(): array
    {
        return ChatWorkflow::getStepData($this->current_step);
    }

    /**
     * Move to next step
     */
    public function moveToNextStep(string $answer): void
    {
        $this->setAnswer($this->current_step, $answer);
        $this->current_step = ChatWorkflow::getNextStep($this->current_step, $answer);
        $this->last_activity_at = now();
        
        // Completion is now handled in the controller when "Done" button is clicked
        // No longer auto-complete when reaching step 99
    }

    /**
     * Check if chat is completed
     */
    public function isCompleted(): bool
    {
        return $this->is_completed;
    }
}