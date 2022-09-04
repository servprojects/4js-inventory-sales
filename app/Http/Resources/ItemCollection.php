<?php

namespace App\Http\Resources;

use App\Item;
use App\Http\Resources\ApiResourceCollection;
use App\Http\Resources\ItemResource;

class ItemCollection extends ApiResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $this->collection->transform(function (Item $Item) {
            return (new ItemResource($Item));
        });

        return parent::toArray($request);
    }
}
