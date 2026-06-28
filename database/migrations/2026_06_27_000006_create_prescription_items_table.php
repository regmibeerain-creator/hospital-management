<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained('prescriptions')->cascadeOnDelete();
            $table->string('medicine_name');
            $table->string('dosage')->nullable()->comment('e.g. 500mg');
            $table->string('frequency')->nullable()->comment('e.g. twice daily');
            $table->string('duration')->nullable()->comment('e.g. 7 days');
            $table->text('instructions')->nullable()->comment('e.g. after meals');
            $table->unsignedInteger('quantity')->default(1);
            $table->boolean('is_required_medicine')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescription_items');
    }
};
