<?php

namespace App\Http\Resources;

use App\Position;
use App\Http\Resources\ApiResourceCollection;
use App\Http\Resources\PositionResource;

class PositionCollection extends ApiResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $this->collection->transform(function (Position $position) {
            return (new PositionResource($position));
        });

        return parent::toArray($request);
    }
}
