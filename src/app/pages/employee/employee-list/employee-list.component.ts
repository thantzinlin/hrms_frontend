import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../models/employee.model';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, PaginationComponent],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = true;
  error = '';
  page = 0;
  size = 10;
  sort = 'id,asc';
  totalPages = 0;
  totalElements = 0;
  pageSizeOptions = [10, 20, 50];
  sortOptions: SortOption[] = [
    { value: 'id,asc', label: 'ID (asc)' },
    { value: 'id,desc', label: 'ID (desc)' },
    { value: 'employeeId,asc', label: 'Employee ID (A–Z)' },
    { value: 'employeeId,desc', label: 'Employee ID (Z–A)' },
    { value: 'name,asc', label: 'Name (A–Z)' },
    { value: 'name,desc', label: 'Name (Z–A)' },
    { value: 'joinDate,desc', label: 'Join Date (newest)' },
    { value: 'joinDate,asc', label: 'Join Date (oldest)' }
  ];

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees(): void {
    const params = { page: this.page, size: this.size, sort: this.sort };
    this.loading = true;
    this.error = '';
    this.employeeService
      .getAll(params)
      .subscribe({
        next: (data) => {
          this.employees = Array.isArray(data) ? data : (data?.content ?? []);
          this.totalPages = data?.totalPages ?? 0;
          this.totalElements = data?.totalElements ?? this.employees.length;
          this.error = '';
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load employees.';
          this.employees = [];
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  deleteEmployee(id: number | string): void {
    if (!confirm('Delete this employee?')) return;
    this.employeeService.delete(id).subscribe({
      next: () => this.getEmployees(),
      error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Delete failed.')
    });
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.getEmployees();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.getEmployees();
    }
  }

  onPageChange(page: number): void {
    this.page = page;
    this.getEmployees();
  }

  onPageSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.getEmployees();
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    this.page = 0;
    this.getEmployees();
  }

  setSortByColumn(field: string): void {
    const [currentField, currentDir] = this.sort.split(',');
    const dir = currentField === field && currentDir === 'asc' ? 'desc' : 'asc';
    this.sort = `${field},${dir}`;
    this.page = 0;
    this.getEmployees();
  }
}
