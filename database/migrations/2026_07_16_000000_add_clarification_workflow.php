<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->enum('status', [
                'submitted',
                'staff_processing',
                'rejected_by_staff',
                'pending_validation',
                'rejected_incomplete',
                'validated',
                'ready_to_archive',
                'archived',
            ])->default('submitted')->after('currency');
        });

        Schema::create('clarifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');

            $table->text('manager_note');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');

            $table->text('question')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('requested_at')->nullable();

            $table->text('answer')->nullable();
            $table->foreignId('answered_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('answered_at')->nullable();

            $table->boolean('needs_supplier')->nullable();
            $table->text('staff_note')->nullable();
            $table->foreignId('staff_decided_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('staff_decided_at')->nullable();

            $table->text('manager_response')->nullable();
            $table->foreignId('manager_responded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('manager_responded_at')->nullable();

            $table->foreignId('admin_acknowledged_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('admin_acknowledged_at')->nullable();

            $table->enum('status', [
                'awaiting_staff_request',
                'awaiting_supplier_answer',
                'awaiting_manager_review',
                'awaiting_admin_ack',
                'resolved',
            ])->default('awaiting_staff_request');
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clarifications');

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->enum('status', [
                'submitted',
                'staff_processing',
                'pending_validation',
                'validated',
                'rejected',
                'ready_to_archive',
                'archived',
            ])->default('submitted')->after('currency');
        });
    }
};
