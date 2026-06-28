<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Cardiology', 'code' => 'CARD', 'description' => 'Heart and cardiovascular system diagnosis and treatment', 'location' => '2nd Floor, East Wing'],
            ['name' => 'Neurology', 'code' => 'NEURO', 'description' => 'Brain, spine, and nervous system disorders', 'location' => '3rd Floor, West Wing'],
            ['name' => 'Orthopedics', 'code' => 'ORTHO', 'description' => 'Bones, joints, ligaments, tendons, and muscles', 'location' => '2nd Floor, West Wing'],
            ['name' => 'Pediatrics', 'code' => 'PED', 'description' => 'Medical care for infants, children, and adolescents', 'location' => '1st Floor, East Wing'],
            ['name' => 'ENT', 'code' => 'ENT', 'description' => 'Ear, nose, and throat diagnosis and treatment', 'location' => '1st Floor, West Wing'],
            ['name' => 'Ophthalmology', 'code' => 'OPHTH', 'description' => 'Eye care and vision services', 'location' => '3rd Floor, East Wing'],
            ['name' => 'Dermatology', 'code' => 'DERM', 'description' => 'Skin, hair, and nail conditions', 'location' => '4th Floor, East Wing'],
            ['name' => 'Gynecology', 'code' => 'GYN', 'description' => 'Female reproductive health and childbirth', 'location' => '4th Floor, West Wing'],
            ['name' => 'Emergency Medicine', 'code' => 'ER', 'description' => '24/7 emergency care and trauma services', 'location' => 'Ground Floor, Emergency Wing'],
            ['name' => 'Radiology', 'code' => 'RAD', 'description' => 'X-ray, CT, MRI, and other imaging services', 'location' => 'Ground Floor, Imaging Wing'],
            ['name' => 'Laboratory', 'code' => 'LAB', 'description' => 'Clinical laboratory testing and diagnostics', 'location' => 'Ground Floor, Lab Wing'],
            ['name' => 'Pharmacy', 'code' => 'PHARM', 'description' => 'Inpatient and outpatient pharmacy services', 'location' => 'Ground Floor, Main Lobby'],
            ['name' => 'General Medicine', 'code' => 'GENMED', 'description' => 'General internal medicine and primary care', 'location' => '1st Floor, Main Wing'],
            ['name' => 'General Surgery', 'code' => 'GENSURG', 'description' => 'General surgical procedures', 'location' => '5th Floor, Surgical Wing'],
        ];

        foreach ($departments as $dept) {
            Department::create($dept);
        }

        $this->command->info('Created ' . count($departments) . ' departments.');
    }
}
