import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../models/employee.model';
import { DepartmentService } from '../../../core/services/department.service';
import { PositionService } from '../../../core/services/position.service';
import { RoleService } from '../../../core/services/role.service';
import { Observable } from 'rxjs';
import { map, finalize, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
  positions$: Observable<{ positionId: number; positionName: string }[]>;
  roles$: Observable<{ roleName: string; description?: string }[]>;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
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
      departmentId: [null as number | null, Validators.required],
      positionId: [null as number | null, Validators.required],
      role: ['', Validators.required]
    });

    this.departments$ = this.departmentService.getAllDepartments();
    this.roles$ = this.roleService.getAll().pipe(
      map((list) => (Array.isArray(list) ? list : []).map((r) => ({
        roleName: r.roleName ?? (r as { roleName?: string }).roleName ?? '',
        description: r.description
      })).filter((r) => r.roleName))
    );
    this.positions$ = this.positionService.getAll().pipe(
      map((list) => (Array.isArray(list) ? list : []).map((p) => ({
        positionId: p.positionId ?? (p as { id?: number }).id ?? 0,
        positionName: p.positionName ?? (p as { positionName?: string }).positionName ?? ''
      })).filter((p) => p.positionId != null))
    );
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id');
      if (this.employeeId) {
        this.isEditMode = true;
        this.loading = true;
        this.error = '';
        this.employeeForm.get('password')?.disable();
        this.employeeForm.get('username')?.disable();
        this.employeeService
          .get(this.employeeId)
          .pipe(
            timeout(15000),
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            })
          )
          .subscribe({
            next: (employee: Employee) => {
              const joinDateVal = employee.joinDate
                ? new Date(employee.joinDate).toISOString().split('T')[0]
                : '';
              this.employeeForm.patchValue({
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                joinDate: joinDateVal,
                status: employee.status ?? 'Active',
                employeeId: employee.employeeId ?? '',
                departmentId: employee.departmentId ?? null,
                positionId: employee.positionId ?? null,
                role: employee.role ?? 'EMPLOYEE'
              });
              this.cdr.detectChanges();
            },
            error: () => {
              this.error = 'Failed to load employee data.';
              this.cdr.detectChanges();
            }
          });
      } else {
        this.employeeForm.get('password')?.enable();
        this.employeeForm.get('username')?.enable();
      }
    });
  }

  get f() { return this.employeeForm.controls; }

  /** Format joinDate for backend: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss" */
  private formatJoinDateForApi(value: string): string {
    if (!value) return value;
    const trimmed = String(value).trim();
    if (trimmed.includes('T')) return trimmed;
    return `${trimmed}T09:00:00`;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.employeeForm.invalid) {
      this.loading = false;
      return;
    }

    const raw = this.employeeForm.value;
    const employeeData: Record<string, unknown> = {
      ...raw,
      joinDate: this.formatJoinDateForApi(raw.joinDate),
      departmentId: raw.departmentId ?? undefined,
      positionId: raw.positionId ?? undefined
    };
    if (this.isEditMode && this.employeeForm.get('password')?.disabled) {
      delete employeeData['password'];
    }
    if (this.isEditMode) {
      delete employeeData['username'];
    }

    if (this.isEditMode && this.employeeId) {
      this.employeeService.update(this.employeeId, employeeData).subscribe(
        () => {
          this.router.navigate(['/employees']);
          this.loading = false;
        },
        () => {
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
        () => {
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