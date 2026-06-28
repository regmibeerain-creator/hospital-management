<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $otp,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Password Reset Code',
        );
    }

    public function content(): Content
    {
        return new Content(
            html: <<<'HTML'
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f4f4f7;">
                <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="{{ asset('images/logo.png') }}" alt="Birendranagar Municipal Hospital" style="width: 48px; height: 48px; border-radius: 8px; object-fit: contain;" />
                    </div>
                    <h2 style="margin: 0 0 8px; font-size: 20px; color: #1f2937;">Password Reset Request</h2>
                    <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 1.6;">Hello {{$user->name}}, use the code below to reset your password. This code expires in 5 minutes.</p>
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; background: #f3f4f6; border-radius: 12px; padding: 16px 32px; letter-spacing: 8px; font-size: 28px; font-weight: bold; color: #1f2937; font-family: 'Courier New', monospace;">{{$otp}}</div>
                    </div>
                    <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; {{ date('Y') }} Birendranagar Municipal Hospital</p>
                </div>
            </body>
            </html>
            HTML,
        );
    }
}
