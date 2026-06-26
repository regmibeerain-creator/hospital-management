<?php

namespace Tests\Feature\Auth;

use App\Mail\EmailVerificationMail;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use DatabaseMigrations, WithFaker;

    private const REGISTER_URL = '/api/register';

    public function test_it_registers_a_user_successfully(): void
    {
        Mail::fake();

        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'phone',
                    'avatar',
                    'onboard_status',
                    'email_verified_at',
                    'phone_verified_at',
                    'created_at',
                    'updated_at',
                ],
                'message',
            ])
            ->assertJson([
                'user' => [
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'phone' => '1234567890',
                    'onboard_status' => 'pending',
                    'phone_verified_at' => null,
                ],
                'message' => 'Registration successful. Please check your email to verify your account.',
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'onboard_status' => 'pending',
        ]);

        $user = User::where('email', 'john@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->email_verified_at);
    }

    public function test_it_sends_email_verification_notification_on_registration(): void
    {
        Mail::fake();

        $payload = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $this->postJson(self::REGISTER_URL, $payload);

        Mail::assertSent(EmailVerificationMail::class);
    }

    public function test_it_requires_name(): void
    {
        $payload = [
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_it_requires_email(): void
    {
        $payload = [
            'name' => 'John Doe',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_it_requires_valid_email(): void
    {
        $payload = [
            'name' => 'John Doe',
            'email' => 'not-an-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_it_requires_password(): void
    {
        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_it_requires_password_minimum_eight_characters(): void
    {
        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_it_requires_password_confirmation(): void
    {
        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_it_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'john@example.com']);

        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_it_registers_without_optional_phone(): void
    {
        Mail::fake();

        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson(self::REGISTER_URL, $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'phone' => null,
        ]);
    }

    public function test_it_hashes_the_password(): void
    {
        Mail::fake();

        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $this->postJson(self::REGISTER_URL, $payload);

        $user = User::where('email', 'john@example.com')->first();

        $this->assertNotEquals('password123', $user->password);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('password123', $user->password));
    }

    public function test_it_returns_custom_validation_messages(): void
    {
        $response = $this->postJson(self::REGISTER_URL, []);

        $response->assertStatus(422)
            ->assertJsonFragment(['name' => ['Please provide your full name.']])
            ->assertJsonFragment(['email' => ['An email address is required.']])
            ->assertJsonFragment(['password' => ['A password is required.']]);
    }
}
