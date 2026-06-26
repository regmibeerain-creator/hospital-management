<?php

namespace App\Actions\Auth;

use App\Mail\OtpMail;
use App\Models\AuditLog;
use App\Models\OtpCode;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Request;

class SendOtpAction
{
    public function execute(User $user, string $type): string
    {
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpCode::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'code' => Hash::make($otp),
            'type' => $type,
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        Mail::to($user->email)->send(new OtpMail($user, $otp, $type));

        AuditLog::log([
            'user_id' => $user->id,
            'action' => "otp_sent_{$type}",
            'entity_type' => 'otp',
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);

        return $otp;
    }
}
