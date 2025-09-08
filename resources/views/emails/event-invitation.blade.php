<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wedding Event Invitation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .event-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .event-details h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 20px;
        }
        .detail-row {
            display: flex;
            margin-bottom: 10px;
            align-items: center;
        }
        .detail-label {
            font-weight: bold;
            width: 120px;
            color: #666;
        }
        .detail-value {
            flex: 1;
            color: #333;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .expiry-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .dj-info {
            background-color: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .dj-info h3 {
            margin: 0 0 10px 0;
            color: #1976d2;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
            }
            .detail-label {
                width: auto;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎉 Wedding Event Invitation</h1>
            <p>You've been invited to join a special wedding event!</p>
        </div>

        <!-- Content -->
        <div class="content">
            <h2>Hello {{ $invitation->client_name ?? 'there' }}!</h2>
            
            <p><strong>{{ $dj->name }}</strong> from <strong>{{ $dj->organization }}</strong> has invited you to join their wedding event planning. This is an exciting opportunity to collaborate on creating the perfect celebration!</p>

            <!-- Event Details -->
            <div class="event-details">
                <h3>📅 Event Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Event Name:</span>
                    <span class="detail-value"><strong>{{ $event->name }}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Event Date:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($event->event_date)->format('l, F j, Y') }}</span>
                </div>
                @if($event->venue_name)
                <div class="detail-row">
                    <span class="detail-label">Venue:</span>
                    <span class="detail-value">{{ $event->venue_name }}</span>
                </div>
                @endif
                @if($event->venue_city && $event->venue_state)
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{ $event->venue_city }}, {{ $event->venue_state }}</span>
                </div>
                @endif
            </div>

            <!-- DJ Information -->
            <div class="dj-info">
                <h3>🎵 Your DJ</h3>
                <p><strong>{{ $dj->name }}</strong><br>
                {{ $dj->organization }}</p>
                <p>Your DJ is ready to work with you to create the perfect musical experience for your special day!</p>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center;">
                <a href="{{ $invitationUrl }}" class="cta-button">
                    Accept Invitation & Join Event
                </a>
            </div>

            <!-- Expiry Notice -->
            <div class="expiry-notice">
                <strong>⏰ Important:</strong> This invitation will expire on {{ \Carbon\Carbon::parse($invitation->expires_at)->format('F j, Y \a\t g:i A') }}. Please accept it before then to join the event planning.
            </div>

            <p>Once you accept the invitation, you'll be able to:</p>
            <ul>
                <li>View and edit event planning details</li>
                <li>Share your music preferences and special songs</li>
                <li>Chat directly with your DJ about the event</li>
                <li>Access the event timeline and schedule</li>
            </ul>

            <p>If you have any questions, feel free to reach out to {{ $dj->name }} directly.</p>

            <p>Best regards,<br>
            The EventSync Team</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This invitation was sent to {{ $invitation->client_email }}</p>
            <p>If you didn't expect this invitation, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
