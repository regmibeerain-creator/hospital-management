<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $otp,
        public string $type,
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->type) {
            'email_verification' => 'Verify Your Email - OTP',
            'login' => 'Your Login Verification Code',
            default => 'Your OTP Code',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
        );
    }
}
