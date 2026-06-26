<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Full system access'],
            ['name' => 'Doctor', 'slug' => 'doctor', 'description' => 'Clinical access - consultations, prescriptions, patient records'],
            ['name' => 'Nurse', 'slug' => 'nurse', 'description' => 'Clinical support - patient care, vitals, medication administration'],
            ['name' => 'Receptionist', 'slug' => 'receptionist', 'description' => 'Front desk - appointments, registrations, billing'],
            ['name' => 'Pharmacist', 'slug' => 'pharmacist', 'description' => 'Pharmacy access - dispensing, inventory'],
            ['name' => 'Patient', 'slug' => 'patient', 'description' => 'Self-service access - appointments, records'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
