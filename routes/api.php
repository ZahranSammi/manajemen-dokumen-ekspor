<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Supplier\DocumentController as SupplierDocumentController;
use App\Http\Controllers\Staff\DocumentController as StaffDocumentController;
use App\Http\Controllers\Manager\DocumentController as ManagerDocumentController;
use App\Http\Controllers\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\NotificationController;

Route::prefix('v1')->group(function () {
    // Auth
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

        // Supplier endpoints
        Route::middleware('role:supplier')->group(function () {
            Route::post('/supplier/documents', [SupplierDocumentController::class, 'store']);
            Route::get('/supplier/documents', [SupplierDocumentController::class, 'index']);
            Route::get('/supplier/documents/{document}', [SupplierDocumentController::class, 'show']);
        });

        // Staff endpoints
        Route::middleware('role:staff_impor')->group(function () {
            Route::get('/staff/inbox', [StaffDocumentController::class, 'inbox']);
            Route::get('/staff/documents/{document}', [StaffDocumentController::class, 'show']);
            Route::put('/staff/documents/{document}/process', [StaffDocumentController::class, 'process']);
            Route::post('/staff/documents/{document}/forward', [StaffDocumentController::class, 'forward']);
        });

        // Manager endpoints
        Route::middleware('role:manager_impor')->group(function () {
            Route::get('/manager/queue', [ManagerDocumentController::class, 'queue']);
            Route::get('/manager/documents/{document}', [ManagerDocumentController::class, 'show']);
            Route::post('/manager/documents/{document}/validate', [ManagerDocumentController::class, 'validate']);
            Route::get('/manager/validated', [ManagerDocumentController::class, 'validated']);
            Route::post('/manager/reports', [ManagerDocumentController::class, 'createReport']);
            Route::post('/manager/reports/{report}/send', [ManagerDocumentController::class, 'sendReport']);
        });

        // Admin endpoints
        Route::middleware('role:admin')->group(function () {
            Route::get('/admin/reports', [AdminDocumentController::class, 'reports']);
            Route::get('/admin/documents', [AdminDocumentController::class, 'documents']);
            Route::get('/admin/documents/{document}', [AdminDocumentController::class, 'show']);
            Route::put('/admin/documents/{document}/prepare', [AdminDocumentController::class, 'prepare']);
            Route::put('/admin/documents/{document}/archive', [AdminDocumentController::class, 'archive']);
            Route::get('/documents/{document}/audit-log', [AdminDocumentController::class, 'auditLog']);
        });

        // Audit log - accessible by Admin and Manager
        Route::middleware('role:admin,manager_impor')->group(function () {
            Route::get('/documents/{document}/audit-log', [AdminDocumentController::class, 'auditLog']);
        });
    });
});
