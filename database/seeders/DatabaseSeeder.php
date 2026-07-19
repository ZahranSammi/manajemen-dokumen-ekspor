<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Supplier;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Supplier User & Profile
        $supplierUser = User::create([
            'name' => 'Supplier',
            'email' => 'supplier@example.com',
            'password' => Hash::make('password'),
            'role' => 'supplier',
        ]);

        Supplier::create([
            'user_id' => $supplierUser->id,
            'company_name' => 'Global Logistics Trade Ltd',
            'address' => '123 Shipping Lane, Singapore',
            'phone' => '+65-9876-5432',
        ]);

        // 2. Create Staff Impor User
        User::create([
            'name' => 'Staff Impor',
            'email' => 'staff@example.com',
            'password' => Hash::make('password'),
            'role' => 'staff_impor',
        ]);

        // 3. Create Manager Impor User
        User::create([
            'name' => 'Manager Impor',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'role' => 'manager_impor',
        ]);

        // 4. Create Admin User
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
    }
}
