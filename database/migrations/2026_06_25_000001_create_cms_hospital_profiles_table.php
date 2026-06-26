<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_hospital_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('hospital_name');
            $table->string('tagline')->nullable();
            $table->text('about')->nullable();
            $table->text('mission')->nullable();
            $table->text('vision')->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            $table->json('social_links')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_hospital_profiles');
    }
};
