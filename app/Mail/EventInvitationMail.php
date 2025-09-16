<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invitation;
    public $invitationUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Invitation $invitation)
    {
        $this->invitation = $invitation;
        // Use the frontend URL for invitation links
        $appUrl = config('app.url', 'http://localhost:8000');
        $this->invitationUrl = $appUrl . '/invitation/' . $invitation->id;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $dj = $this->invitation->dj;
        $fromName = $dj->name;
        
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address(
                config('mail.from.address'),
                $fromName
            ),
            subject: 'Wedding Event Invitation - ' . $this->invitation->event->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.event-invitation',
            with: [
                'invitation' => $this->invitation,
                'invitationUrl' => $this->invitationUrl,
                'event' => $this->invitation->event,
                'dj' => $this->invitation->dj,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
