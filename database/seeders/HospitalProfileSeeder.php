<?php

namespace Database\Seeders;

use App\Models\CmsHospitalProfile;
use Illuminate\Database\Seeder;

class HospitalProfileSeeder extends Seeder
{
    public function run(): void
    {
        CmsHospitalProfile::firstOrCreate(
            ['hospital_name' => 'Birendranagar Municipal Hospital'],
            [
                'tagline' => 'Your Health, Our Priority — 24/7 Emergency Services Available',
                'about' => 'Birendranagar Municipal Hospital (Birendranagar Nagar Hospital) is a government-run healthcare facility located in Katkuwa, Birendranagar Municipality-7, Surkhet, Nepal. We provide comprehensive healthcare services with state-of-the-art facilities, experienced doctors, and compassionate care. Our hospital is open 24/7 to serve the community with emergency services, outpatient consultations, inpatient care, diagnostics, pharmacy, and specialized health packages.',
                'mission' => 'To provide accessible, affordable, and quality healthcare services to all residents of Birendranagar Municipality and surrounding regions through compassionate care and continuous improvement.',
                'vision' => 'To be a model municipal hospital in Nepal, setting standards for community healthcare excellence through innovation, dedication, and community partnership.',
                'address' => 'Katkuwa, Birendranagar Municipality-7, Surkhet, Nepal',
                'phone' => '083-524403',
                'email' => 'info@birendranagarmun.gov.np',
                'logo' => '/images/logo.png',
                'social_links' => [
                    'facebook' => 'https://www.facebook.com/nagarhospitalskt/',
                ],

            ]
        );

        $this->command->info('Hospital profile seeded successfully.');
    }
}
