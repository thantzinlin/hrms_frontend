import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { UserListItem } from '../../../models/user.model';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, PaginationComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: UserListItem[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  page = 0;
  size = 10;
  sort = 'userId,asc';
  totalPages = 0;
  totalElements = 0;
  pageSizeOptions = [10, 20, 50];
  sortOptions: SortOption[] = [
    { value: 'userId,asc', label: 'User ID (A–Z)' },
    { value: 'userId,desc', label: 'User ID (Z–A)' },
    { value: 'username,asc', label: 'Username (A–Z)' },
    { value: 'username,desc', label: 'Username (Z–A)' },
    { value: 'email,asc', label: 'Email (A–Z)' },
    { value: 'email,desc', label: 'Email (Z–A)' }
  ];

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    const params: Record<string, string | number> = { page: this.page, size: this.size, sort: this.sort };
    if (this.searchTerm && this.searchTerm.trim()) {
      params['search'] = this.searchTerm.trim();
    }
    this.loading = true;
    this.error = '';
    this.userService
      .getAll(params)
      .subscribe({
        next: (data) => {
          this.users = Array.isArray(data) ? data : (data?.content ?? []);
          this.totalPages = data?.totalPages ?? 0;
          this.totalElements = data?.totalElements ?? this.users.length;
          this.error = '';
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load users.';
          this.users = [];
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.getUsers();
  }

  onPageSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.getUsers();
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    this.page = 0;
    this.getUsers();
  }

  setSortByColumn(field: string): void {
    const [currentField, currentDir] = this.sort.split(',');
    const dir = currentField === field && currentDir === 'asc' ? 'desc' : 'asc';
    this.sort = `${field},${dir}`;
    this.page = 0;
    this.getUsers();
  }

  onSearch(): void {
    this.page = 0;
    this.getUsers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 0;
    this.getUsers();
  }

  formatRoles(roles: string[] | undefined): string {
    if (!roles || roles.length === 0) return '-';
    return roles.join(', ');
  }
}
