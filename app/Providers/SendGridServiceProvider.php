<?php

namespace App\Providers;

use App\Mail\Transport\SendGridTransport;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Mail;

class SendGridServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Mail::extend('sendgrid', function (array $config = []) {
            return new SendGridTransport(
                config('services.sendgrid.api_key'),
                $this->app['events'],
                $this->app['log']
            );
        });
    }
}
