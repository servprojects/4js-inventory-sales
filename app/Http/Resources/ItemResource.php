<?php

namespace App\Http\Resources;

use App\Custom\Hasher;

class ItemResource extends ApiResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'created_at' => (string)$this->created_at->toDateTimeString(),
            'updated_at' => (string)$this->updated_at->toDateTimeString(),
            'id' => $this->id,
            'name' => $this->name,
            'brand_id' => $this->brand_id,
            'size' => $this->size,
            'category_id' => $this->category_id,
            'original_price' => $this->original_price,
            'unit_price' => $this->unit_price,
        ];
    }
}
