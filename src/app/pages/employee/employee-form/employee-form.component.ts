import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../core/services/employee.service';
import { MessageDialogService } from '../../../core/services/message-dialog.service';
import { Employee } from '../../../models/employee.model';
import { Department } from '../../../models/department.model';
import { DepartmentService } from '../../../core/services/department.service';
import { PositionService } from '../../../core/services/position.service';
import { RoleService } from '../../../core/services/role.service';
import { Observable } from 'rxjs';
import { map, finalize, timeout } from 'rxjs/operators';
import { LoadingComponent } from '../../../shared/loading/loading.component';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingComponent],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;
  /** Current employee id when editing (used to exclude self from "Reports to" dropdown). */
  currentEmployeeId: number | null = null;
  loading = false;
  departments$: Observable<any[]>;
  positions$: Observable<{ positionId: number; positionName: string }[]>;
  roles$: Observable<{ roleName: string; description?: string }[]>;
  submitted = false;
  /** Employees list for "Reports to" dropdown (content from paginated API). */
  employeesForReporting$: Observable<Employee[]>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private roleService: RoleService,
    private messageDialog: MessageDialogService,
    private cdr: ChangeDetectorRef
  ) {
    this.employeeForm = this.fb.group({
      employeeId: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      joinDate: ['', Validators.required],
      status: ['Active', Validators.required],
      fatherName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      race: ['', Validators.required],
      gender: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      nrc: ['', Validators.required],
      departmentId: [null as number | null, Validators.required],
      positionId: [null as number | null, Validators.required],
      role: ['', Validators.required],
      reportingToId: [null as number | null],
      canApproveLeave: [false],
      canApproveOvertime: [false],
      isHr: [false],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.departments$ = this.departmentService.getAllDepartments().pipe(
      map((page: { content?: Department[] }) => (page?.content ?? []) as Department[])
    );
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
    this.employeesForReporting$ = this.employeeService.getAll({ size: 500 }).pipe(
      map((page: { content?: Employee[] }) => (page?.content ?? []) as Employee[])
    );
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.employeeId = params.get('id');
      if (this.employeeId) {
        this.isEditMode = true;
        this.loading = true;
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
              this.currentEmployeeId = employee.id ?? null;
              const joinDateVal = employee.joinDate
                ? new Date(employee.joinDate).toISOString().split('T')[0]
                : '';
              const dobVal = employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '';
              this.employeeForm.patchValue({
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                joinDate: joinDateVal,
                status: employee.status ?? 'Active',
                fatherName: employee.fatherName ?? '',
                dateOfBirth: dobVal,
                nationality: employee.nationality ?? '',
                race: employee.race ?? '',
                gender: employee.gender ?? '',
                maritalStatus: employee.maritalStatus ?? '',
                nrc: employee.nrc ?? '',
                employeeId: employee.employeeId ?? '',
                departmentId: employee.departmentId ?? null,
                positionId: employee.positionId ?? null,
                role: employee.role ?? 'EMPLOYEE',
                reportingToId: employee.reportingToId ?? null,
                canApproveLeave: employee.canApproveLeave ?? false,
                canApproveOvertime: employee.canApproveOvertime ?? false,
                isHr: employee.isHr ?? false
              });
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.messageDialog.showApiError(err);
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
      this.employeeForm.markAllAsTouched();
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const raw = this.employeeForm.getRawValue();
    const employeeData: Record<string, unknown> = {
      ...raw,
      joinDate: this.formatJoinDateForApi(raw.joinDate),
      dateOfBirth: (raw.dateOfBirth && String(raw.dateOfBirth).trim()) ? String(raw.dateOfBirth).trim() : null,
      fatherName: raw.fatherName ?? null,
      nationality: raw.nationality ?? null,
      race: raw.race ?? null,
      gender: raw.gender ?? null,
      maritalStatus: raw.maritalStatus ?? null,
      nrc: raw.nrc ?? null,
      departmentId: raw.departmentId ?? undefined,
      positionId: raw.positionId ?? undefined,
      reportingToId: raw.reportingToId ?? null,
      canApproveLeave: raw.canApproveLeave ?? false,
      canApproveOvertime: raw.canApproveOvertime ?? false,
      isHr: raw.isHr ?? false
    };
    if (this.isEditMode && this.employeeForm.get('password')?.disabled) {
      delete employeeData['password'];
    }
    if (this.isEditMode) {
      delete employeeData['username'];
    }

    this.loading = true;
    if (this.isEditMode && this.employeeId) {
      this.employeeService.update(this.employeeId, employeeData).pipe(
        finalize(() => { this.loading = false; this.cdr.detectChanges(); })
      ).subscribe({
        next: () => {
          this.messageDialog.showSuccess('Employee updated successfully.');
          this.router.navigate(['/employees']);
        },
        error: (err) => this.messageDialog.showApiError(err)
      });
    } else {
      this.employeeService.create(employeeData).pipe(
        finalize(() => { this.loading = false; this.cdr.detectChanges(); })
      ).subscribe({
        next: () => {
          this.messageDialog.showSuccess('Employee created successfully.');
          this.router.navigate(['/employees']);
        },
        error: (err) => this.messageDialog.showApiError(err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }
}