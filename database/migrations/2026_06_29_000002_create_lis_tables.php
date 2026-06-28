<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Test Catalog
        Schema::create('lab_test_catalogs', function (Blueprint $table) {
            $table->id();
            $table->string('test_name');
            $table->string('test_code')->unique();
            $table->string('department')->nullable(); // biochemistry, hematology, microbiology, serology, etc.
            $table->string('specimen_type')->nullable(); // blood, urine, stool, sputum, swab, etc.
            $table->string('unit')->nullable();
            $table->decimal('reference_range_low', 12, 4)->nullable();
            $table->decimal('reference_range_high', 12, 4)->nullable();
            $table->string('reference_range_text')->nullable(); // for non-numeric ranges
            $table->string('gender')->nullable(); // male, female, null=both
            $table->integer('age_min')->nullable();
            $table->integer('age_max')->nullable();
            $table->integer('turnaround_minutes')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->text('instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Lab Samples
        Schema::create('lab_samples', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('collected_by')->nullable()->constrained('users');
            $table->string('accession_number')->unique();
            $table->string('specimen_type');
            $table->string('status')->default('ordered');
            // lifecycle: ordered -> collected -> accessioned -> in_progress -> validated -> released -> rejected
            $table->timestamp('collected_at')->nullable();
            $table->timestamp('accessioned_at')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Lab Test Orders (links samples to tests)
        Schema::create('lab_test_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('doctor_id')->nullable()->constrained('doctors');
            $table->foreignId('appointment_id')->nullable()->constrained();
            $table->foreignId('lab_sample_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_number')->unique();
            $table->string('priority')->default('routine'); // routine, urgent, stat
            $table->text('clinical_notes')->nullable();
            $table->string('status')->default('ordered'); // ordered, collected, in_progress, completed, cancelled
            $table->foreignId('ordered_by')->constrained('users');
            $table->timestamps();
        });

        // Lab Test Results
        Schema::create('lab_test_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_test_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lab_test_catalog_id')->constrained();
            $table->decimal('result_value', 14, 4)->nullable();
            $table->string('result_text')->nullable(); // for non-numeric results
            $table->string('unit')->nullable();
            $table->decimal('reference_range_low', 12, 4)->nullable();
            $table->decimal('reference_range_high', 12, 4)->nullable();
            $table->string('reference_range_text')->nullable();
            $table->string('flag')->nullable(); // normal, high, low, critical_high, critical_low
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, completed, validated, amended
            $table->foreignId('entered_by')->nullable()->constrained('users');
            $table->foreignId('validated_by')->nullable()->constrained('users');
            $table->timestamp('validated_at')->nullable();
            $table->text('amendment_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_test_results');
        Schema::dropIfExists('lab_test_orders');
        Schema::dropIfExists('lab_samples');
        Schema::dropIfExists('lab_test_catalogs');
    }
};
