<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;

class NotificationService
{
    public static function send(int $userId, string $title, string $message, ?string $type = 'info', ?array $data = null): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
        ]);
    }

    public static function sendToRole(string $role, string $title, string $message, ?string $type = 'info', ?array $data = null): void
    {
        $users = User::where('role', $role)->get();
        foreach ($users as $user) {
            self::send($user->id, $title, $message, $type, $data);
        }
    }
}
