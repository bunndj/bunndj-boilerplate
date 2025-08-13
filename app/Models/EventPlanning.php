<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventPlanning extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'event_id',
        'planning_data',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'planning_data' => 'array',
        ];
    }

    /**
     * Get the event that owns this planning data
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get a specific planning field value
     */
    public function getPlanningField(string $fieldName): ?string
    {
        $planningData = $this->planning_data ?? [];
        $field = collect($planningData)->firstWhere('field_name', $fieldName);
        return $field['field_value'] ?? null;
    }

    /**
     * Set a specific planning field value
     */
    public function setPlanningField(string $fieldName, string $fieldValue): void
    {
        $planningData = $this->planning_data ?? [];
        $updated = false;
        
        foreach ($planningData as &$field) {
            if ($field['field_name'] === $fieldName) {
                $field['field_value'] = $fieldValue;
                $updated = true;
                break;
            }
        }
        
        if (!$updated) {
            $planningData[] = [
                'field_name' => $fieldName,
                'field_value' => $fieldValue
            ];
        }
        
        $this->planning_data = $planningData;
    }

    /**
     * Get all planning fields as a collection
     */
    public function getPlanningFields()
    {
        return collect($this->planning_data ?? []);
    }

    /**
     * Get completion percentage
     */
    public function getCompletionPercentage(): int
    {
        $planningData = $this->planning_data ?? [];
        if (empty($planningData)) {
            return 0;
        }

        $totalFields = count($planningData);
        $completedFields = collect($planningData)
            ->filter(fn($field) => !empty($field['field_value']))
            ->count();
        
        return $totalFields > 0 ? round(($completedFields / $totalFields) * 100) : 0;
    }
}
