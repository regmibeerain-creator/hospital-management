<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicalReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'doctor' => new DoctorResource($this->whenLoaded('doctor')),
            'appointment_id' => $this->appointment_id,
            'report_title' => $this->report_title,
            'report_type' => $this->report_type,
            'file_path' => $this->file_path,
            'description' => $this->description,
            'uploaded_by' => $this->uploaded_by,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
