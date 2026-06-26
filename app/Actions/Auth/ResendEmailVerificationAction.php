<?php

namespace App\Actions\Auth;

use App\Models\User;

class ResendEmailVerificationAction
{
    /**
     * Resend the email verification notification.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function execute(string $email): User
    {
        $user = User::where('email', $email)->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            abort(422, 'Email already verified.');
        }

        $user->sendEmailVerificationNotification();

        return $user;
    }
}
