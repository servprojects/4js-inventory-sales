<?php

namespace App\Http\Resources;

use App\Branch;
use App\Http\Resources\ApiResourceCollection;
use App\Http\Resources\BranchResource;

class BranchCollection extends ApiResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $this->collection->transform(function (Branch $branch) {
            return (new BranchResource($branch));
        });

        return parent::toArray($request);
    }
}
