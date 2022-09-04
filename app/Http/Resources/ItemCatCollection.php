<?php

namespace App\Http\Resources;

use App\Item_category;
use App\Http\Resources\ApiResourceCollection;
use App\Http\Resources\ItemCatResource;

class ItemCatCollection extends ApiResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $this->collection->transform(function (Item_category $Item_category) {
            return (new ItemCatResource($Item_category));
        });

        return parent::toArray($request);
    }
}
