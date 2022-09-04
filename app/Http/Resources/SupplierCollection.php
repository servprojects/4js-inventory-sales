<?php

namespace App\Http\Resources;

use App\Supplier;
use App\Http\Resources\ApiResourceCollection;
use App\Http\Resources\SupplierResource;

class SupplierCollection extends ApiResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $this->collection->transform(function (Supplier $supplier) {
            return (new SupplierResource($supplier));
        });

        return parent::toArray($request);
    }
}
