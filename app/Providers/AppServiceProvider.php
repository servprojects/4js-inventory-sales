<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Resources\Json\Resource;
use Illuminate\Database\Schema\Builder;
use Illuminate\Support\Facades\App;
use Hashids\Hashids;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Builder::defaultStringLength(191);

        if (App::environment('production')) {
            $this->app['request']->server->set('HTTPS', true); //https if production mode
          }
    
          if (App::environment(['local', 'staging'])) {
            $this->app['request']->server->set('HTTPS', false); //http if dev mode
          }
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(Hashids::class, function () {
            return new Hashids(env('HASHIDS_SALT'), 10);
        });
    }
    
}
