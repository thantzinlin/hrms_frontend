import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { RouterModule } from '@angular/router'; // Import RouterModule
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true, // Mark as standalone
  imports: [CommonModule, RouterModule], // Import necessary modules
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

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees(): void {
    const params = {
      page: this.page,
      size: this.size,
      sort: this.sort
    };
    this.loading = true;
    this.employeeService.getAll(params).subscribe(
      (data: any) => { // Using any as the backend response structure for pagination might vary
        this.employees = data.content;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      (error: any) => {
        this.error = error;
        this.loading = false;
      }
    );
  }

  deleteEmployee(id: any): void {
    if (!confirm('Delete this employee?')) return;
    this.employeeService.delete(id).subscribe(() => this.getEmployees(), (error: any) => {
      this.error = error;
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
