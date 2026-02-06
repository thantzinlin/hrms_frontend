import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { PositionService } from '../../../core/services/position.service';
import { Position } from '../../../models/position.model';
import { MessageDialogService } from '../../../core/services/message-dialog.service';

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.css']
})
export class PositionListComponent implements OnInit {
  positions: Position[] = [];
  loading = true;
  error = '';
  showForm = false;
  editingId: number | null = null;
  formLoading = false;
  positionForm: FormGroup;

  constructor(
    private positionService: PositionService,
    private messageDialog: MessageDialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.positionForm = this.fb.group({
      positionName: ['', Validators.required],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadPositions();
  }

  loadPositions(): void {
    this.loading = true;
    this.error = '';
    this.positionService
      .getAll()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.positions = Array.isArray(data) ? data : [];
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Failed to load positions.';
          this.positions = [];
          this.messageDialog.showApiError(err);
          this.cdr.detectChanges();
        }
      });
  }

  openAdd(): void {
    this.editingId = null;
    this.positionForm.reset({ positionName: '', description: '', isActive: true });
    this.showForm = true;
  }

  openEdit(position: Position): void {
    const id = position.positionId ?? (position as { id?: number }).id;
    if (id == null) return;
    this.editingId = id;
    this.positionForm.patchValue({
      positionName: position.positionName ?? '',
      description: position.description ?? '',
      isActive: position.isActive !== false
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.positionForm.reset({ positionName: '', description: '', isActive: true });
  }

  save(): void {
    if (this.positionForm.invalid) return;
    this.formLoading = true;
    const value = this.positionForm.value;
    const payload: Position = {
      positionName: value.positionName,
      description: value.description ?? '',
      isActive: value.isActive !== false
    };

    const obs =
      this.editingId != null
        ? this.positionService.update(this.editingId, { ...payload, positionId: this.editingId })
        : this.positionService.create(payload);
    obs
      .pipe(finalize(() => (this.formLoading = false)))
      .subscribe({
        next: () => {
          this.loadPositions();
          this.cancelForm();
          this.messageDialog.showSuccess('Position saved successfully.');
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Save failed.';
          this.messageDialog.showApiError(err);
        }
      });
  }

  deletePosition(position: Position): void {
    const id = position.positionId ?? (position as { id?: number }).id;
    if (id == null) return;
    const name = position.positionName ?? 'this position';
    if (!confirm(`Delete position "${name}"?`)) return;
    this.positionService.delete(id).subscribe({
      next: () => {
        this.loadPositions();
        this.messageDialog.showSuccess('Position deleted.');
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Delete failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  get f() {
    return this.positionForm.controls;
  }

  positionId(p: Position): number | undefined {
    return p.positionId ?? (p as { id?: number }).id;
  }

  positionName(p: Position): string {
    return p.positionName ?? '';
  }
}
