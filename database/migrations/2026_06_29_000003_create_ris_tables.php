<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Imaging Orders — received from BPR or created directly
        Schema::create('imaging_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('referring_doctor_id')->nullable();
            $table->unsignedBigInteger('radiologist_id')->nullable(); // assigned radiologist
            $table->string('order_number', 50)->unique();
            $table->string('study_type', 100); // X-Ray, CT, MRI, USG, Mammography, Fluoroscopy, DEXA
            $table->string('body_part', 255)->nullable(); // specific anatomy
            $table->text('clinical_history')->nullable();
            $table->text('notes')->nullable();
            $table->enum('priority', ['routine', 'urgent', 'stat'])->default('routine');
            $table->enum('status', ['ordered', 'scheduled', 'acquired', 'reporting', 'signed', 'delivered'])->default('ordered');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('referring_doctor_id')->references('id')->on('doctors')->onDelete('set null');
            $table->foreign('radiologist_id')->references('id')->on('doctors')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        // Modality Schedule — per-modality calendar slots
        Schema::create('modality_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('imaging_order_id');
            $table->string('modality', 50); // X-Ray, CT, MRI, USG, Mammography, etc.
            $table->dateTime('scheduled_at');
            $table->integer('duration_minutes')->default(30);
            $table->string('room', 100)->nullable();
            $table->text('preparation_notes')->nullable(); // patient prep instructions
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'])->default('scheduled');
            $table->unsignedBigInteger('technician_id')->nullable();
            $table->timestamps();

            $table->foreign('imaging_order_id')->references('id')->on('imaging_orders')->onDelete('cascade');
            $table->foreign('technician_id')->references('id')->on('users')->onDelete('set null');
        });

        // Imaging Studies — acquired studies / DICOM references
        Schema::create('imaging_studies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('imaging_order_id');
            $table->string('study_uid', 100)->nullable()->unique(); // DICOM Study Instance UID
            $table->string('accession_number', 50)->nullable()->unique(); // RIS accession number
            $table->string('modality', 50);
            $table->integer('series_count')->default(0);
            $table->integer('instance_count')->default(0);
            $table->string('dicom_path')->nullable(); // path to DICOM files
            $table->text('acquisition_notes')->nullable();
            $table->enum('quality', ['acceptable', 'suboptimal', 'repeat'])->nullable();
            $table->enum('status', ['pending', 'acquired', 'completed', 'rejected'])->default('pending');
            $table->unsignedBigInteger('acquired_by')->nullable();
            $table->timestamp('acquired_at')->nullable();
            $table->timestamps();

            $table->foreign('imaging_order_id')->references('id')->on('imaging_orders')->onDelete('cascade');
            $table->foreign('acquired_by')->references('id')->on('users')->onDelete('set null');
        });

        // Structured Reports — radiology reports with findings/impression/recommendation
        Schema::create('structured_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('imaging_order_id');
            $table->unsignedBigInteger('imaging_study_id')->nullable();
            $table->string('report_title', 255);
            $table->text('technique')->nullable(); // technique description
            $table->text('findings')->nullable(); // radiology findings
            $table->text('impression')->nullable(); // diagnostic impression
            $table->text('recommendation')->nullable(); // follow-up recommendations
            $table->text('comparison')->nullable(); // comparison with prior studies
            $table->enum('status', ['draft', 'preliminary', 'signed', 'amended'])->default('draft');
            $table->boolean('is_double_read')->default(false);
            $table->unsignedBigInteger('primary_reader_id')->nullable();
            $table->unsignedBigInteger('secondary_reader_id')->nullable();
            $table->text('amendment_reason')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('imaging_order_id')->references('id')->on('imaging_orders')->onDelete('cascade');
            $table->foreign('imaging_study_id')->references('id')->on('imaging_studies')->onDelete('set null');
            $table->foreign('primary_reader_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('secondary_reader_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('structured_reports');
        Schema::dropIfExists('imaging_studies');
        Schema::dropIfExists('modality_schedules');
        Schema::dropIfExists('imaging_orders');
    }
};
