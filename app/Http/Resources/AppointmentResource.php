<?php

namespace App\Http\Resources;

use App\Http\Resources\MedicalReportResource;
use App\Http\Resources\PatientResource;
use App\Http\Resources\PrescriptionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient' => new PatientResource($this->whenLoaded('patient')),
            'doctor' => new DoctorResource($this->whenLoaded('doctor')),
            'appointment_date' => $this->appointment_date,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'status' => $this->status,
            'symptoms' => $this->symptoms,
            'notes' => $this->notes,
            'appointment_type' => $this->appointment_type,
            'cancellation_reason' => $this->cancellation_reason,
            'can_be_cancelled' => $this->canBeCancelled(),
            'is_upcoming' => $this->isUpcoming(),
            'medical_reports' => MedicalReportResource::collection($this->whenLoaded('medicalReports')),
            'prescriptions' => PrescriptionResource::collection($this->whenLoaded('prescriptions')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
