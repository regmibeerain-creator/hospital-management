<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'doctor' => new DoctorResource($this->whenLoaded('doctor')),
            'appointment_id' => $this->appointment_id,
            'diagnosis' => $this->diagnosis,
            'notes' => $this->notes,
            'follow_up_date' => $this->follow_up_date,
            'status' => $this->status,
            'items' => PrescriptionItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
