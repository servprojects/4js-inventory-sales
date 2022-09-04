<?php

namespace App\Http\Resources;

use App\Brand;
use App\Http\Resources\ApiResourceCollection;
use App\Http\Resources\BrandResource;

class BrandCollection extends ApiResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $this->collection->transform(function (Brand $brand) {
            return (new BrandResource($brand));
        });

        return parent::toArray($request);
    }
}
