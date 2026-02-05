import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { DepartmentService } from '../../core/services/department.service';
import { MessageDialogService } from '../../core/services/message-dialog.service';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css']
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = true;
  error = '';
  showForm = false;
  editingId: number | null = null;
  formLoading = false;
  departmentForm: FormGroup;

  constructor(
    private departmentService: DepartmentService,
    private messageDialog: MessageDialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.departmentForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.error = '';
    this.departmentService
      .getAllDepartments()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.departments = this.normalizeList(data);
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load departments.';
          this.departments = [];
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  /** Accept array or paged response { content: Department[] }. */
  private normalizeList(data: unknown): Department[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'content' in data) {
      const content = (data as { content?: unknown })['content'];
      return Array.isArray(content) ? content : [];
    }
    return [];
  }

  openAdd(): void {
    this.editingId = null;
    this.departmentForm.reset({ name: '' });
    this.showForm = true;
  }

  openEdit(department: Department): void {
    if (department.id == null) return;
    this.editingId = department.id;
    this.departmentForm.patchValue({ name: department.name });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.departmentForm.reset({ name: '' });
  }

  save(): void {
    if (this.departmentForm.invalid) return;
    this.formLoading = true;
    const value = this.departmentForm.value;

    const obs =
      this.editingId != null
        ? this.departmentService.updateDepartment(this.editingId, { id: this.editingId, name: value.name })
        : this.departmentService.createDepartment({ name: value.name } as Department);
    obs
      .pipe(finalize(() => (this.formLoading = false)))
      .subscribe({
        next: () => {
          this.loadDepartments();
          this.cancelForm();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Save failed.';
          this.messageDialog.showApiError(err);
        }
      });
  }

  deleteDepartment(department: Department): void {
    if (department.id == null) return;
    if (!confirm(`Delete department "${department.name}"?`)) return;
    this.departmentService.deleteDepartment(department.id).subscribe({
      next: () => this.loadDepartments(),
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Delete failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  get f() {
    return this.departmentForm.controls;
  }
}
