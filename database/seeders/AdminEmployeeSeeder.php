<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminEmployeeSeeder extends Seeder
{
	public function run(): void
	{
		User::firstOrCreate(
			['email' => 'admin@example.com'],
			[
				'name' => 'Admin User',
				'role' => User::ROLE_ADMIN,
				'password' => Hash::make('password'),
			]
		);

		User::firstOrCreate(
			['email' => 'employee@example.com'],
			[
				'name' => 'Employee User',
				'role' => User::ROLE_EMPLOYEE,
				'password' => Hash::make('password'),
			]
		);
	}
}


