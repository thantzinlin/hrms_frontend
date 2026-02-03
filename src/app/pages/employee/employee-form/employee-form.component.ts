import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Import RouterModule
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../models/employee.model';
import { DepartmentService } from '../../../core/services/department.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // Add RouterModule
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;
  loading = false;
  error = '';
  departments$: Observable<any[]>;
  submitted = false; // Add missing submitted property

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService
  ) {
    this.employeeForm = this.fb.group({
      employeeId: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      joinDate: ['', Validators.required],
      status: ['Active', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      departmentId: ['', Validators.required],
      position: ['', Validators.required],
      role: ['EMPLOYEE', Validators.required]
    });

    this.departments$ = this.departmentService.getAllDepartments();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id');
      if (this.employeeId) {
        this.isEditMode = true;
        this.loading = true;
        this.employeeForm.get('password')?.disable();
        this.employeeForm.get('username')?.disable();
        this.employeeService.get(this.employeeId).subscribe(
          (employee: Employee) => {
            // Do not destructure password, as it's not in the Employee model for security
            const employeeData = employee; // Use employee directly or pick desired fields
            this.employeeForm.patchValue({
              ...employeeData,
              joinDate: employeeData.joinDate ? new Date(employeeData.joinDate).toISOString().split('T')[0] : ''
            });
            this.loading = false;
          },
          (error: any) => { // Add type for error
            this.error = 'Failed to load employee data.';
            this.loading = false;
          }
        );
      } else {
        this.employeeForm.get('password')?.enable();
        this.employeeForm.get('username')?.enable();
      }
    });
  }

  get f() { return this.employeeForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.employeeForm.invalid) {
      this.loading = false;
      return;
    }

    const employeeData = this.employeeForm.value;
    if (this.isEditMode && this.employeeForm.get('password')?.disabled) {
      delete employeeData.password;
    }

    if (this.isEditMode && this.employeeId) {
      this.employeeService.update(this.employeeId, employeeData).subscribe(
        () => {
          this.router.navigate(['/employees']);
          this.loading = false;
        },
        (error: any) => { // Add type for error
          this.error = 'Failed to update employee.';
          this.loading = false;
        }
      );
    } else {
      this.employeeService.create(employeeData).subscribe(
        () => {
          this.router.navigate(['/employees']);
          this.loading = false;
        },
        (error: any) => { // Add type for error
          this.error = 'Failed to create employee.';
          this.loading = false;
        }
      );
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }
}