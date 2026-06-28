<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            DepartmentSeeder::class,
            HospitalProfileSeeder::class,
        ]);

        $adminRole = Role::where('slug', 'admin')->first();

        User::factory()->create([
            'name' => 'Admin User',
            'mobile_number' => '1234567890',
            'email' => 'admin@hospital.com',
            'role_id' => $adminRole?->id,
        ]);
    }
}
