<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'description',
    ];

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) return $default;

        $value = $setting->value;

        return match ($setting->type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'number' => is_numeric($value) ? ($value == (int) $value ? (int) $value : (float) $value) : $value,
            default => $value,
        };
    }

    public static function setValue(string $key, mixed $value, string $group = 'general', string $type = 'text', ?string $description = null): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => (string) $value,
                'group' => $group,
                'type' => $type,
                'description' => $description,
            ]
        );
    }

    public static function getByGroup(string $group): array
    {
        return static::where('group', $group)->get()->keyBy('key')->toArray();
    }
}
