<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Supplier\DocumentController as SupplierDocumentController;
use App\Http\Controllers\Staff\DocumentController as StaffDocumentController;
use App\Http\Controllers\Manager\DocumentController as ManagerDocumentController;
use App\Http\Controllers\Admin\DocumentController as AdminDocumentController;

Route::get('/', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notifications API (in-app)
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    // File downloads
    Route::get('/files/{file}/download', [FileController::class, 'downloadDocument'])->name('files.download');
    Route::get('/reports/{report}/download', [FileController::class, 'downloadReport'])->name('reports.download');

    // Supplier routes
    Route::middleware(['role:supplier'])->prefix('supplier')->name('supplier.')->group(function () {
        Route::get('/documents', [SupplierDocumentController::class, 'index'])->name('documents');
        Route::get('/documents/create', [SupplierDocumentController::class, 'create'])->name('documents.create');
        Route::post('/documents', [SupplierDocumentController::class, 'store'])->name('documents.store');
        Route::get('/documents/{document}', [SupplierDocumentController::class, 'show'])->name('documents.show');
        Route::put('/documents/{document}/revise', [SupplierDocumentController::class, 'revise'])->name('documents.revise');
        Route::put('/clarifications/{clarification}/answer', [SupplierDocumentController::class, 'answerClarification'])->name('clarifications.answer');
    });

    // Staff Impor routes
    Route::middleware(['role:staff_impor'])->prefix('staff')->name('staff.')->group(function () {
        Route::get('/inbox', [StaffDocumentController::class, 'inbox'])->name('inbox');
        Route::get('/documents/{document}', [StaffDocumentController::class, 'show'])->name('documents.show');
        Route::put('/documents/{document}/process', [StaffDocumentController::class, 'process'])->name('documents.process');
        Route::post('/documents/{document}/forward', [StaffDocumentController::class, 'forward'])->name('documents.forward');
        Route::put('/documents/{document}/reject', [StaffDocumentController::class, 'reject'])->name('documents.reject');
        Route::get('/clarifications', [StaffDocumentController::class, 'clarifications'])->name('clarifications');
        Route::get('/clarifications/{clarification}', [StaffDocumentController::class, 'showClarification'])->name('clarifications.show');
        Route::put('/clarifications/{clarification}/request', [StaffDocumentController::class, 'requestClarification'])->name('clarifications.request');
        Route::put('/clarifications/{clarification}/skip', [StaffDocumentController::class, 'skipSupplier'])->name('clarifications.skip');
    });

    // Manager Impor routes
    Route::middleware(['role:manager_impor'])->prefix('manager')->name('manager.')->group(function () {
        Route::get('/queue', [ManagerDocumentController::class, 'queue'])->name('queue');
        Route::get('/documents/{document}', [ManagerDocumentController::class, 'show'])->name('documents.show');
        Route::post('/documents/{document}/validate', [ManagerDocumentController::class, 'validate'])->name('documents.validate');
        Route::get('/validated', [ManagerDocumentController::class, 'validated'])->name('validated');
        Route::get('/reports', [ManagerDocumentController::class, 'reports'])->name('reports');
        Route::post('/reports', [ManagerDocumentController::class, 'createReport'])->name('reports.create');
        Route::post('/reports/{report}/send', [ManagerDocumentController::class, 'sendReport'])->name('reports.send');
        Route::get('/clarifications', [ManagerDocumentController::class, 'clarificationQueue'])->name('clarifications');
        Route::get('/clarifications/{clarification}', [ManagerDocumentController::class, 'showClarification'])->name('clarifications.show');
        Route::put('/clarifications/{clarification}/answer', [ManagerDocumentController::class, 'answerClarification'])->name('clarifications.answer');
    });

    // Admin routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/reports', [AdminDocumentController::class, 'reports'])->name('reports');
        Route::get('/documents', [AdminDocumentController::class, 'documents'])->name('documents');
        Route::get('/documents/{document}', [AdminDocumentController::class, 'show'])->name('documents.show');
        Route::put('/documents/{document}/prepare', [AdminDocumentController::class, 'prepare'])->name('documents.prepare');
        Route::put('/documents/{document}/archive', [AdminDocumentController::class, 'archive'])->name('documents.archive');
        Route::get('/documents/{document}/audit-log', [AdminDocumentController::class, 'auditLog'])->name('documents.auditLog');
        Route::get('/clarifications', [AdminDocumentController::class, 'clarifications'])->name('clarifications');
        Route::get('/clarifications/{clarification}', [AdminDocumentController::class, 'showClarification'])->name('clarifications.show');
        Route::put('/clarifications/{clarification}/acknowledge', [AdminDocumentController::class, 'acknowledgeClarification'])->name('clarifications.acknowledge');
    });
});
