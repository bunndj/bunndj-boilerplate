<?php

namespace App\Mail\Transport;

use Illuminate\Support\Facades\Http;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;
use Psr\EventDispatcher\EventDispatcherInterface;
use Psr\Log\LoggerInterface;

class SendGridTransport extends AbstractTransport
{
    protected $apiKey;

    public function __construct(string $apiKey, EventDispatcherInterface $dispatcher = null, LoggerInterface $logger = null)
    {
        parent::__construct($dispatcher, $logger);
        $this->apiKey = $apiKey;
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());
        
        // Prepare SendGrid API payload
        $payload = [
            'personalizations' => [
                [
                    'to' => [],
                    'cc' => [],
                    'bcc' => [],
                    'subject' => $email->getSubject()
                ]
            ],
            'from' => [],
            'content' => []
        ];
        
        // Set from address
        $from = $email->getFrom()[0];
        $payload['from'] = [
            'email' => $from->getAddress(),
            'name' => $from->getName()
        ];
        
        // Set to addresses
        foreach ($email->getTo() as $to) {
            $payload['personalizations'][0]['to'][] = [
                'email' => $to->getAddress(),
                'name' => $to->getName()
            ];
        }
        
        // Set CC addresses
        foreach ($email->getCc() as $cc) {
            $payload['personalizations'][0]['cc'][] = [
                'email' => $cc->getAddress(),
                'name' => $cc->getName()
            ];
        }
        
        // Set BCC addresses
        foreach ($email->getBcc() as $bcc) {
            $payload['personalizations'][0]['bcc'][] = [
                'email' => $bcc->getAddress(),
                'name' => $bcc->getName()
            ];
        }
        
        // Set content
        if ($email->getTextBody()) {
            $payload['content'][] = [
                'type' => 'text/plain',
                'value' => $email->getTextBody()
            ];
        }
        
        if ($email->getHtmlBody()) {
            $payload['content'][] = [
                'type' => 'text/html',
                'value' => $email->getHtmlBody()
            ];
        }
        
        // Handle attachments
        if ($email->getAttachments()) {
            $payload['attachments'] = [];
            foreach ($email->getAttachments() as $attachment) {
                $payload['attachments'][] = [
                    'content' => base64_encode($attachment->getBody()),
                    'type' => $attachment->getMediaType(),
                    'filename' => $attachment->getFilename(),
                    'disposition' => 'attachment'
                ];
            }
        }
        
        // Clean up empty arrays
        if (empty($payload['personalizations'][0]['cc'])) {
            unset($payload['personalizations'][0]['cc']);
        }
        if (empty($payload['personalizations'][0]['bcc'])) {
            unset($payload['personalizations'][0]['bcc']);
        }
        
        // Send the email via SendGrid API
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json'
        ])->post('https://api.sendgrid.com/v3/mail/send', $payload);
        
        if (!$response->successful()) {
            throw new \Exception('SendGrid API error: ' . $response->body());
        }
    }

    public function __toString(): string
    {
        return 'sendgrid';
    }
}
