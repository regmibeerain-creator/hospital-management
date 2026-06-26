<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $adminRole = Role::where('slug', 'admin')->first();

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@hospital.com',
            'role_id' => $adminRole?->id,
        ]);
    }
}
