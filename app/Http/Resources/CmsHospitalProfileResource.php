<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CmsHospitalProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'hospital_name' => $this->hospital_name,
            'tagline' => $this->tagline,
            'about' => $this->about,
            'mission' => $this->mission,
            'vision' => $this->vision,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'logo' => $this->logo,
            'favicon' => $this->favicon,
            'social_links' => $this->social_links,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
