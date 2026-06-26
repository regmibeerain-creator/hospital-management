<?php

namespace App\Actions\Auth;

use App\Models\User;

class CreateUserAction
{
    public function execute(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'mobile_number' => $data['mobile_number'] ?? null,
            'password' => $data['password'],
            'onboard_status' => 'pending',
            'role_id' => $data['role_id'] ?? null,
        ]);
    }
}
