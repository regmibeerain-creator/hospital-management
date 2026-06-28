<?php

namespace Tests\Feature\Api;

use App\Mail\EmailVerificationMail;
use App\Mail\OtpMail;
use App\Mail\PasswordResetMail;
use App\Models\AuditLog;
use App\Models\DeviceLog;
use App\Models\LoginLog;
use App\Models\OtpCode;
use App\Models\PasswordReset;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private function validRegistrationData(): array
    {
        return [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'mobile_number' => '9812345678',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];
    }

    private function extractOtpFromMail(string $mailableClass): string
    {
        $otp = '';
        Mail::assertSent($mailableClass, function ($mail) use (&$otp) {
            $otp = $mail->otp;
            return true;
        });
        return $otp;
    }

    private function createVerifiedUser(): User
    {
        return User::factory()->create([
            'email_verified_at' => now(),
        ]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  REGISTRATION
    // ═══════════════════════════════════════════════════════════════════════

    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/register', $this->validRegistrationData());

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'onboard_status'],
            ]);
        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'onboard_status' => 'pending',
        ]);

        Mail::assertSent(EmailVerificationMail::class);
    }

    public function test_registration_requires_name(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_registration_requires_valid_email(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John',
            'email' => 'not-an-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_requires_unique_email(): void
    {
        User::factory()->create(['email' => 'john@example.com']);

        $response = $this->postJson('/api/register', $this->validRegistrationData());

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_requires_minimum_password_length(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John',
            'email' => 'john@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_registration_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_registration_creates_audit_log(): void
    {
        $this->postJson('/api/register', $this->validRegistrationData());

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'user_registered',
            'entity_type' => 'user',
        ]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  EMAIL VERIFICATION
    // ═══════════════════════════════════════════════════════════════════════

    public function test_user_can_verify_email_with_valid_signed_url(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        $response = $this->getJson($signedUrl);

        $response->assertOk()
            ->assertJson(['message' => 'Email verified successfully.']);
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_email_verification_fails_with_invalid_signature(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $response = $this->getJson("/api/email/verify/{$user->id}?signature=invalid&expires=" . now()->addHour()->timestamp);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Invalid or expired verification link.']);
    }

    public function test_email_verification_fails_for_already_verified_user(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)],
        );

        $response = $this->getJson($signedUrl);

        $response->assertOk()
            ->assertJson(['message' => 'Email already verified.']);
    }

    public function test_user_can_resend_verification_email(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
            'email' => 'unverified@example.com',
        ]);

        $response = $this->postJson('/api/resend-verification', [
            'email' => 'unverified@example.com',
        ]);

        $response->assertOk()
            ->assertJson(['message' => 'Verification email resent.']);
        Mail::assertSent(EmailVerificationMail::class);
    }

    public function test_resend_verification_fails_for_nonexistent_email(): void
    {
        $response = $this->postJson('/api/resend-verification', [
            'email' => 'nobody@example.com',
        ]);

        $response->assertStatus(422);
    }

    public function test_resend_verification_fails_for_already_verified_email(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $response = $this->postJson('/api/resend-verification', [
            'email' => $user->email,
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Email already verified.']);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  LOGIN
    // ═══════════════════════════════════════════════════════════════════════

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials.']);
    }

    public function test_user_cannot_login_with_unverified_email(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'requires_email_verification' => true,
                'email' => $user->email,
            ]);
    }

    public function test_user_can_login_with_verified_email_and_receives_otp(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'requires_otp',
                'token',
            ])
            ->assertJson(['requires_otp' => true]);
        $this->assertTrue($response['requires_otp']);

        Mail::assertSent(OtpMail::class);
    }

    public function test_login_creates_login_log_and_device_log(): void
    {
        $user = $this->createVerifiedUser();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ], ['User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0']);

        $this->assertDatabaseHas('login_logs', [
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('device_logs', [
            'user_id' => $user->id,
            'platform' => 'macOS',
            'browser' => 'Chrome',
        ]);
    }

    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  OTP VERIFICATION
    // ═══════════════════════════════════════════════════════════════════════

    public function test_user_can_verify_login_otp(): void
    {
        $user = $this->createVerifiedUser();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $otp = $this->extractOtpFromMail(OtpMail::class);

        $response = $this->postJson('/api/verify-otp', [
            'email' => $user->email,
            'code' => $otp,
            'type' => 'login',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'OTP verified successfully.',
                'type' => 'login',
            ]);
    }

    public function test_user_cannot_verify_with_invalid_otp(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->postJson('/api/verify-otp', [
            'email' => $user->email,
            'code' => '000000',
            'type' => 'login',
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Invalid or expired OTP.']);
    }

    public function test_otp_verification_requires_valid_type(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->postJson('/api/verify-otp', [
            'email' => $user->email,
            'code' => '123456',
            'type' => 'invalid_type',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_otp_can_verify_email(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        // Send OTP
        $this->postJson('/api/resend-otp', [
            'email' => $user->email,
            'type' => 'email_verification',
        ]);

        $otp = $this->extractOtpFromMail(OtpMail::class);

        $response = $this->postJson('/api/verify-otp', [
            'email' => $user->email,
            'code' => $otp,
            'type' => 'email_verification',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'OTP verified successfully.',
                'type' => 'email_verification',
            ]);
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  RESEND OTP
    // ═══════════════════════════════════════════════════════════════════════

    public function test_user_can_resend_otp(): void
    {
        $user = $this->createVerifiedUser();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        // Clear the first OTP mail
        Mail::fake();

        $response = $this->postJson('/api/resend-otp', [
            'email' => $user->email,
            'type' => 'login',
        ]);

        $response->assertOk()
            ->assertJson(['message' => 'OTP resent to your email.']);
        Mail::assertSent(OtpMail::class);
    }

    public function test_resend_otp_fails_for_nonexistent_email(): void
    {
        $response = $this->postJson('/api/resend-otp', [
            'email' => 'nobody@example.com',
            'type' => 'login',
        ]);

        $response->assertStatus(422);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  FORGOT PASSWORD
    // ═══════════════════════════════════════════════════════════════════════

    public function test_user_can_request_password_reset(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'reset_token'])
            ->assertJson(['message' => 'Password reset code sent to your email.']);

        Mail::assertSent(PasswordResetMail::class);
        $this->assertDatabaseHas('password_resets', [
            'email' => $user->email,
            'status' => 'pending',
        ]);
    }

    public function test_forgot_password_fails_for_nonexistent_email(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nobody@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_forgot_password_creates_audit_log(): void
    {
        $user = $this->createVerifiedUser();

        $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'password_reset_requested',
            'entity_type' => 'user',
        ]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  VERIFY RESET OTP
    // ═══════════════════════════════════════════════════════════════════════

    public function test_user_can_verify_reset_otp(): void
    {
        $user = $this->createVerifiedUser();

        $resetResponse = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);
        $resetToken = $resetResponse['reset_token'];
        $otp = $this->extractOtpFromMail(PasswordResetMail::class);

        $response = $this->postJson('/api/verify-reset-otp', [
            'email' => $user->email,
            'code' => $otp,
            'reset_token' => $resetToken,
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'reset_token'])
            ->assertJson(['message' => 'Code verified. You can now reset your password.']);
        $this->assertNotEquals($resetToken, $response['reset_token']);
    }

    public function test_verify_reset_otp_fails_with_invalid_code(): void
    {
        $user = $this->createVerifiedUser();

        $resetResponse = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);
        $resetToken = $resetResponse['reset_token'];

        $response = $this->postJson('/api/verify-reset-otp', [
            'email' => $user->email,
            'code' => '000000',
            'reset_token' => $resetToken,
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Invalid or expired reset code.']);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  RESET PASSWORD
    // ═══════════════════════════════════════════════════════════════════════

    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = $this->createVerifiedUser();

        // Step 1: Request reset
        $resetResponse = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);
        $resetToken = $resetResponse['reset_token'];
        $otp = $this->extractOtpFromMail(PasswordResetMail::class);

        // Step 2: Verify OTP
        $verifyResponse = $this->postJson('/api/verify-reset-otp', [
            'email' => $user->email,
            'code' => $otp,
            'reset_token' => $resetToken,
        ]);
        $newResetToken = $verifyResponse['reset_token'];

        // Step 3: Reset password
        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => $newResetToken,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertOk()
            ->assertJson(['message' => 'Password has been reset successfully. Please login with your new password.']);

        // Verify the new password works
        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->password));
    }

    public function test_reset_password_fails_with_invalid_token(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => 'invalid-token',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Invalid or expired reset token.']);
    }

    public function test_reset_password_requires_password_confirmation(): void
    {
        $user = $this->createVerifiedUser();

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => 'some-token',
            'password' => 'NewPassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_reset_password_invalidates_old_tokens(): void
    {
        $user = $this->createVerifiedUser();
        $user->createToken('old-token');

        // Complete the full reset flow
        $resetResponse = $this->postJson('/api/forgot-password', ['email' => $user->email]);
        $resetToken = $resetResponse['reset_token'];
        $otp = $this->extractOtpFromMail(PasswordResetMail::class);

        $verifyResponse = $this->postJson('/api/verify-reset-otp', [
            'email' => $user->email,
            'code' => $otp,
            'reset_token' => $resetToken,
        ]);
        $newResetToken = $verifyResponse['reset_token'];

        $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => $newResetToken,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  LOGOUT
    // ═══════════════════════════════════════════════════════════════════════

    public function test_authenticated_user_can_logout(): void
    {
        $user = $this->createVerifiedUser();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $response->assertOk()
            ->assertJson(['message' => 'Logged out successfully.']);

        // Token should be deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_logout(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    public function test_logout_creates_audit_log(): void
    {
        $user = $this->createVerifiedUser();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'logout',
            'entity_type' => 'user',
        ]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  COMPLETE AUTH FLOW (happy path)
    // ═══════════════════════════════════════════════════════════════════════

    public function test_complete_auth_flow_registration_to_logout(): void
    {
        // 1. Register
        $registerResponse = $this->postJson('/api/register', $this->validRegistrationData());
        $registerResponse->assertStatus(201);
        $userId = $registerResponse['user']['id'];

        // 2. Verify email via signed URL
        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $userId, 'hash' => sha1('john@example.com')],
        );
        $this->getJson($signedUrl)->assertOk();
        $this->assertNotNull(User::find($userId)->email_verified_at);

        // 3. Login
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);
        $loginResponse->assertOk();
        $token = $loginResponse['token'];

        // 4. Verify login OTP
        $otp = $this->extractOtpFromMail(OtpMail::class);
        $this->postJson('/api/verify-otp', [
            'email' => 'john@example.com',
            'code' => $otp,
            'type' => 'login',
        ])->assertOk();

        // 5. Logout
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout')->assertOk();
    }

    public function test_complete_password_reset_flow(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'email_verified_at' => now(),
        ]);

        // 1. Forgot password
        $forgotResponse = $this->postJson('/api/forgot-password', [
            'email' => 'reset@example.com',
        ]);
        $forgotResponse->assertOk();
        $resetToken = $forgotResponse['reset_token'];

        // 2. Get OTP from mail
        $otp = $this->extractOtpFromMail(PasswordResetMail::class);

        // 3. Verify reset OTP
        $verifyResponse = $this->postJson('/api/verify-reset-otp', [
            'email' => 'reset@example.com',
            'code' => $otp,
            'reset_token' => $resetToken,
        ]);
        $verifyResponse->assertOk();
        $newResetToken = $verifyResponse['reset_token'];

        // 4. Reset password
        $this->postJson('/api/reset-password', [
            'email' => 'reset@example.com',
            'token' => $newResetToken,
            'password' => 'BrandNewPass1!',
            'password_confirmation' => 'BrandNewPass1!',
        ])->assertOk();

        // 5. Login with new password
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'reset@example.com',
            'password' => 'BrandNewPass1!',
        ]);
        $loginResponse->assertOk();
    }
}
