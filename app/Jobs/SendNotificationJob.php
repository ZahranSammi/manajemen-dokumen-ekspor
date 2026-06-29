<?php

namespace App\Jobs;

use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private int $userId,
        private string $title,
        private string $message,
        private string $type = 'info',
        private ?array $data = null,
    ) {}

    public function handle(): void
    {
        NotificationService::send($this->userId, $this->title, $this->message, $this->type, $this->data);
    }
}
