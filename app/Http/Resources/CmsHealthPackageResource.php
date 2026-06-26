<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CmsHealthPackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'included_services' => $this->included_services,
            'price' => (float) $this->price,
            'original_price' => (float) $this->original_price,
            'discount_percent' => $this->discount_percent,
            'duration' => $this->duration,
            'featured_image' => $this->featured_image,
            'is_featured' => $this->is_featured,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
