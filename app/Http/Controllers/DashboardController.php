<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Notification;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $stats = $this->getStats($user);
        $recentDocuments = $this->getRecentDocuments($user);
        $unreadNotifications = Notification::where('user_id', $user->id)->whereNull('read_at')->count();

        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
            'stats' => $stats,
            'recentDocuments' => $recentDocuments,
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    private function getStats($user): array
    {
        return match ($user->role) {
            'supplier' => [
                'submitted' => Document::whereHas('supplier', fn ($q) => $q->where('user_id', $user->id))->where('status', 'submitted')->count(),
                'processing' => Document::whereHas('supplier', fn ($q) => $q->where('user_id', $user->id))->whereIn('status', ['staff_processing', 'pending_validation'])->count(),
                'validated' => Document::whereHas('supplier', fn ($q) => $q->where('user_id', $user->id))->where('status', 'validated')->count(),
                'rejected' => Document::whereHas('supplier', fn ($q) => $q->where('user_id', $user->id))->where('status', 'rejected')->count(),
            ],
            'staff_impor' => [
                'inbox' => Document::where('status', 'submitted')->count(),
                'processing' => Document::where('status', 'staff_processing')->count(),
                'returned' => Document::where('status', 'rejected')->count(),
                'forwarded' => Document::where('status', 'pending_validation')->count(),
            ],
            'manager_impor' => [
                'pending' => Document::where('status', 'pending_validation')->count(),
                'validated' => Document::where('status', 'validated')->count(),
                'rejected' => Document::where('status', 'rejected')->count(),
                'reports' => Report::where('created_by', $user->id)->count(),
            ],
            'admin' => [
                'total_documents' => Document::count(),
                'validated' => Document::where('status', 'validated')->count(),
                'ready_to_archive' => Document::where('status', 'ready_to_archive')->count(),
                'archived' => Document::where('status', 'archived')->count(),
            ],
            default => [],
        };
    }

    private function getRecentDocuments($user)
    {
        $query = Document::with('supplier')->orderByDesc('updated_at')->limit(5);

        if ($user->role === 'supplier') {
            $query->whereHas('supplier', fn ($q) => $q->where('user_id', $user->id));
        } elseif ($user->role === 'staff_impor') {
            $query->whereIn('status', ['submitted', 'staff_processing', 'rejected']);
        } elseif ($user->role === 'manager_impor') {
            $query->whereIn('status', ['pending_validation', 'validated', 'rejected']);
        }

        return $query->get();
    }
}
