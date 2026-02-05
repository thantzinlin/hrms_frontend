import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.employees = Array.isArray(data) ? data : (data?.content ?? []);
          this.totalPages = data?.totalPages ?? 0;
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load employees.';
          this.employees = [];
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
}
