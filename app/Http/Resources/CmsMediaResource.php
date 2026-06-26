<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CmsMediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'file_path' => $this->file_path,
            'url' => $this->url,
            'file_type' => $this->file_type,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'formatted_size' => $this->formatted_size,
            'alt_text' => $this->alt_text,
            'caption' => $this->caption,
            'created_at' => $this->created_at,
        ];
    }
}
