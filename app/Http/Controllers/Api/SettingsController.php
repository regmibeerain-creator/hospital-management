<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SystemSetting::all()->groupBy('group');

        $grouped = [];
        foreach ($settings as $group => $items) {
            $grouped[$group] = $items->mapWithKeys(fn ($s) => [
                $s->key => [
                    'id' => $s->id,
                    'key' => $s->key,
                    'value' => $s->type === 'boolean' ? filter_var($s->value, FILTER_VALIDATE_BOOLEAN) : $s->value,
                    'type' => $s->type,
                    'description' => $s->description,
                ],
            ]);
        }

        return response()->json(['data' => $grouped]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.group' => 'nullable|string',
            'settings.*.type' => 'nullable|string',
            'settings.*.description' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $setting) {
            SystemSetting::setValue(
                $setting['key'],
                $setting['value'] ?? '',
                $setting['group'] ?? 'general',
                $setting['type'] ?? 'text',
                $setting['description'] ?? null,
            );
        }

        return response()->json(['message' => 'Settings updated.']);
    }

    public function getByGroup(string $group): JsonResponse
    {
        return response()->json([
            'data' => SystemSetting::getByGroup($group),
        ]);
    }
}
