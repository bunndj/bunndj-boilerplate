<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventDocument extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'event_id',
        'document_type',
        'file_path',
        'original_filename',
        'file_size',
        'mime_type',
        'parsed_data',
        'is_processed',
        'uploaded_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'parsed_data' => 'array',
            'is_processed' => 'boolean',
            'file_size' => 'integer',
        ];
    }

    /**
     * Get the event that owns this document
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the user who uploaded this document
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the S3 URL for this document
     */
    public function getS3UrlAttribute(): string
    {
        return \Storage::disk('s3')->url($this->file_path);
    }

    /**
     * Get the file size in human readable format
     */
    public function getHumanReadableSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get the confidence score from parsed data
     */
    public function getConfidenceScoreAttribute(): float
    {
        return $this->parsed_data['confidence_score'] ?? 0;
    }

    /**
     * Get the extracted fields from parsed data
     */
    public function getExtractedFieldsAttribute(): array
    {
        return $this->parsed_data['extracted_fields'] ?? [];
    }

    /**
     * Check if document has been successfully parsed
     */
    public function isSuccessfullyParsed(): bool
    {
        return $this->is_processed && 
               isset($this->parsed_data['extracted_fields']) && 
               !empty($this->parsed_data['extracted_fields']);
    }

    /**
     * Get the document type label
     */
    public function getDocumentTypeLabelAttribute(): string
    {
        return match($this->document_type) {
            'pdf' => 'PDF Document',
            'email' => 'Email',
            'note' => 'Note',
            default => 'Unknown'
        };
    }
}
