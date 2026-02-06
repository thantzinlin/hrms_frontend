import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mx-auto w-full max-w-7xl">
      <div class="mb-6">
        <h1 class="text-xl font-semibold text-gray-800 sm:text-2xl">Users</h1>
        <p class="mt-1 text-sm text-gray-600">User management (Admin)</p>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p class="text-center text-gray-600">User management is not implemented yet. Configure roles and menus in the meantime.</p>
      </div>
    </div>
  `,
  styles: []
})
export class UsersPlaceholderComponent {}
