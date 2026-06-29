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
        // 1. Suppliers Table
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('company_name');
            $table->text('address')->nullable();
            $table->string('phone', 20)->nullable();
            $table->timestamps();
        });

        // 2. Documents Table
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('document_number', 100)->unique();
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->date('document_date');
            $table->string('goods_type');
            $table->string('origin_country', 100);
            $table->decimal('goods_value', 15, 2);
            $table->char('currency', 3)->default('IDR');
            $table->enum('status', ['submitted', 'staff_processing', 'pending_validation', 'validated', 'rejected', 'ready_to_archive', 'archived'])->default('submitted');
            $table->foreignId('current_handler_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        // 3. Document Files Table
        Schema::create('document_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->string('file_path', 500);
            $table->string('file_name');
            $table->string('mime_type', 100);
            $table->integer('file_size')->unsigned();
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();
        });

        // 4. Reports Table
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('sent_to')->constrained('users')->onDelete('cascade');
            $table->string('report_file_path', 500);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // 5. Audit Logs Table (Append-only)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade');
            $table->string('action', 100);
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('document_files');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('suppliers');
    }
};
