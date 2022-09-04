<?php

namespace App\Http\Resources;

use App\Project;
use App\Http\Resources\ApiResourceCollection;
use App\Http\Resources\ProjectResource;

class ProjectCollection extends ApiResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $this->collection->transform(function (Project $project) {
            return (new ProjectResource($project));
        });

        return parent::toArray($request);
    }
}
