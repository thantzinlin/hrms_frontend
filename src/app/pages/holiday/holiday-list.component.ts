import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { HolidayService } from '../../core/services/holiday.service';
import { Holiday } from '../../models/holiday.model';

@Component({
  selector: 'app-holiday-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './holiday-list.component.html',
  styleUrls: ['./holiday-list.component.css']
})
export class HolidayListComponent implements OnInit {
  holidays: Holiday[] = [];
  loading = true;
  error = '';
  showForm = false;
  editingId: number | null = null;
  formLoading = false;
  holidayForm: FormGroup;

  constructor(
    private holidayService: HolidayService,
    private fb: FormBuilder
  ) {
    this.holidayForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays(): void {
    this.loading = true;
    this.error = '';
    this.holidayService
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => (this.holidays = Array.isArray(data) ? data : []),
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Failed to load holidays.')
      });
  }

  openAdd(): void {
    this.editingId = null;
    this.holidayForm.reset({ name: '', date: '' });
    this.showForm = true;
  }

  openEdit(holiday: Holiday): void {
    if (holiday.id == null) return;
    this.editingId = holiday.id;
    const dateVal = holiday.date ? holiday.date.toString().split('T')[0] : '';
    this.holidayForm.patchValue({ name: holiday.name, date: dateVal });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.holidayForm.reset({ name: '', date: '' });
  }

  save(): void {
    if (this.holidayForm.invalid) return;
    this.formLoading = true;
    const value = this.holidayForm.value;
    const payload: Holiday = { name: value.name, date: value.date };

    const obs =
      this.editingId != null
        ? this.holidayService.update(this.editingId, payload)
        : this.holidayService.create(payload);
    obs
      .pipe(finalize(() => (this.formLoading = false)))
      .subscribe({
        next: () => {
          this.loadHolidays();
          this.cancelForm();
        },
        error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Save failed.')
      });
  }

  deleteHoliday(holiday: Holiday): void {
    if (holiday.id == null) return;
    if (!confirm(`Delete holiday "${holiday.name}"?`)) return;
    this.holidayService.delete(holiday.id).subscribe({
      next: () => this.loadHolidays(),
      error: (err) => (this.error = err?.message ?? err?.returnMessage ?? 'Delete failed.')
    });
  }

  get f() {
    return this.holidayForm.controls;
  }
}
