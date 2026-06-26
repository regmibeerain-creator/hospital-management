<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Catch-all route for the React SPA — serve the app for all non-API paths
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
