<?php

namespace App\Http\Controllers\Api;

use App\Actions\Auth\CreateUserAction;
use App\Actions\Auth\SendOtpAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Mail\EmailVerificationMail;
use App\Mail\PasswordResetMail;
use App\Models\AuditLog;
use App\Models\DeviceLog;
use App\Models\LoginLog;
use App\Models\OtpCode;
use App\Models\PasswordReset;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(
        private readonly CreateUserAction $createUser,
        private readonly SendOtpAction $sendOtp,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $this->createUser->execute($validated);

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        Mail::to($user->email)->send(new EmailVerificationMail($user, $signedUrl));

        AuditLog::log([
            'user_id' => $user->id,
            'action' => 'user_registered',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'new_values' => ['name' => $user->name, 'email' => $user->email],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Registration successful. Please check your email to verify your account.',
            'user' => new UserResource($user),
        ], 201);
    }

    public function verifyEmail(Request $request, $id): JsonResponse
    {
        if (!$request->hasValidSignature()) {
            return response()->json(['message' => 'Invalid or expired verification link.'], 403);
        }

        $user = User::findOrFail($id);

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $user->markEmailAsVerified();
        $user->update(['onboard_status' => 'email_verified']);

        return response()->json(['message' => 'Email verified successfully.']);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->validated())) {
            AuditLog::log([
                'action' => 'login_failed',
                'entity_type' => 'user',
                'new_values' => ['email' => $request->email],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $user = Auth::user();

        if (!$user->hasVerifiedEmail()) {
            Auth::logout();
            return response()->json([
                'message' => 'Please verify your email address first.',
                'requires_email_verification' => true,
                'email' => $user->email,
            ], 403);
        }

        $this->recordLogin($user, $request);

        $this->sendOtp->execute($user, 'login');

        $token = $user->createToken('auth-token')->plainTextToken;

        AuditLog::log([
            'user_id' => $user->id,
            'action' => 'login_otp_sent',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'OTP sent to your email. Please verify to complete login.',
            'requires_otp' => true,
            'token' => $token,
        ]);
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->firstOrFail();

        $otpRecord = OtpCode::validForEmail($user->email, $validated['type'])
            ->latest()
            ->first();

        if (!$otpRecord || !Hash::check($validated['code'], $otpRecord->code)) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 422);
        }

        $otpRecord->update(['used_at' => Carbon::now()]);

        if ($validated['type'] === 'email_verification') {
            $user->markEmailAsVerified();
            $user->update(['onboard_status' => 'email_verified']);
        }

        if ($validated['type'] === 'login') {
            $user->update(['onboard_status' => 'completed']);

            AuditLog::log([
                'user_id' => $user->id,
                'action' => 'login_completed',
                'entity_type' => 'user',
                'entity_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return response()->json([
            'message' => 'OTP verified successfully.',
            'type' => $validated['type'],
        ]);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email|exists:users,email',
            'type' => 'required|string|in:login,email_verification,password_reset',
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();

        OtpCode::where('user_id', $user->id)
            ->where('type', $validated['type'])
            ->whereNull('used_at')
            ->update(['used_at' => Carbon::now()]);

        $this->sendOtp->execute($user, $validated['type']);

        return response()->json(['message' => 'OTP resent to your email.']);
    }

    public function resendEmailVerification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email|exists:users,email',
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 422);
        }

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        Mail::to($user->email)->send(new EmailVerificationMail($user, $signedUrl));

        return response()->json(['message' => 'Verification email resent.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = User::where('email', $validated['email'])->firstOrFail();

        PasswordReset::where('user_id', $user->id)
            ->where('status', 'pending')
            ->update(['used_at' => Carbon::now(), 'status' => 'expired']);

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $token = Str::random(64);

        PasswordReset::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'token' => Hash::make($token),
            'otp_code' => Hash::make($otp),
            'status' => 'pending',
            'expires_at' => Carbon::now()->addMinutes(15),
        ]);

        Mail::to($user->email)->send(new PasswordResetMail($user, $otp));

        AuditLog::log([
            'user_id' => $user->id,
            'action' => 'password_reset_requested',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Password reset code sent to your email.',
            'reset_token' => $token,
        ]);
    }

    public function verifyResetOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email|exists:users,email',
            'code' => 'required|string|size:6',
            'reset_token' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();

        $resetRecord = PasswordReset::where('email', $user->email)
            ->valid()
            ->latest()
            ->first();

        if (
            !$resetRecord
            || !$resetRecord->otp_code
            || !Hash::check($validated['code'], $resetRecord->otp_code)
            || !Hash::check($validated['reset_token'], $resetRecord->token)
        ) {
            return response()->json(['message' => 'Invalid or expired reset code.'], 422);
        }

        $resetRecord->update([
            'otp_code' => null,
            'status' => 'otp_verified',
        ]);

        $newToken = Str::random(64);
        $resetRecord->update(['token' => Hash::make($newToken)]);

        return response()->json([
            'message' => 'Code verified. You can now reset your password.',
            'reset_token' => $newToken,
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->firstOrFail();

        $resetRecord = PasswordReset::where('email', $user->email)
            ->where('status', 'otp_verified')
            ->latest()
            ->first();

        if (
            !$resetRecord
            || !$resetRecord->token
            || !Hash::check($validated['token'], $resetRecord->token)
            || !$resetRecord->isValid()
        ) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        $resetRecord->update([
            'used_at' => Carbon::now(),
            'status' => 'completed',
        ]);

        $user->tokens()->delete();

        AuditLog::log([
            'user_id' => $user->id,
            'action' => 'password_reset_completed',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Password has been reset successfully. Please login with your new password.',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        LoginLog::where('user_id', $user->id)
            ->whereNull('logout_at')
            ->latest()
            ->first()
            ?->update(['logout_at' => Carbon::now()]);

        $token = $user->currentAccessToken();
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        AuditLog::log([
            'user_id' => $user->id,
            'action' => 'logout',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Logged out successfully.']);
    }

    private function recordLogin(User $user, Request $request): void
    {
        $ip = $request->ip();
        $ua = $request->userAgent();

        LoginLog::create([
            'user_id' => $user->id,
            'ip_address' => $ip,
            'user_agent' => $ua,
            'login_at' => Carbon::now(),
        ]);

        $device = $this->parseUserAgent($ua);

        DeviceLog::updateOrCreate(
            [
                'user_id' => $user->id,
                'device_name' => $device['device_name'],
                'browser' => $device['browser'],
                'platform' => $device['platform'],
            ],
            [
                'device_type' => $device['device_type'],
                'ip_address' => $ip,
                'user_agent' => $ua,
                'last_login_at' => Carbon::now(),
            ],
        );
    }

    private function parseUserAgent(?string $ua): array
    {
        $result = [
            'device_type' => null,
            'device_name' => null,
            'platform' => null,
            'browser' => null,
        ];

        if (!$ua) {
            return $result;
        }

        if (preg_match('/android/i', $ua)) {
            $result['device_type'] = 'mobile';
            $result['platform'] = 'Android';
        } elseif (preg_match('/(ipad|iphone|ipod)/i', $ua)) {
            $result['device_type'] = 'mobile';
            $result['platform'] = 'iOS';
        } elseif (preg_match('/windows/i', $ua)) {
            $result['platform'] = 'Windows';
            $result['device_type'] = 'desktop';
        } elseif (preg_match('/macintosh|mac os x/i', $ua)) {
            $result['platform'] = 'macOS';
            $result['device_type'] = 'desktop';
        } elseif (preg_match('/linux/i', $ua)) {
            $result['platform'] = 'Linux';
            $result['device_type'] = 'desktop';
        }

        if (preg_match('/chrome/i', $ua)) {
            $result['browser'] = 'Chrome';
        } elseif (preg_match('/firefox/i', $ua)) {
            $result['browser'] = 'Firefox';
        } elseif (preg_match('/safari/i', $ua)) {
            $result['browser'] = 'Safari';
        } elseif (preg_match('/edge/i', $ua)) {
            $result['browser'] = 'Edge';
        }

        return $result;
    }
}
