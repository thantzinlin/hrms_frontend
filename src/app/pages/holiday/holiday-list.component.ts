import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { HolidayService } from '../../core/services/holiday.service';
import { Holiday } from '../../models/holiday.model';
import { MessageDialogService } from '../../core/services/message-dialog.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { PaginationComponent, SortOption } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-holiday-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent, PaginationComponent],
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
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  sort = 'date,asc';
  pageSizeOptions = [10, 20, 50];
  sortOptions: SortOption[] = [
    { value: 'date,asc', label: 'Date (earliest)' },
    { value: 'date,desc', label: 'Date (latest)' },
    { value: 'name,asc', label: 'Name (A–Z)' },
    { value: 'name,desc', label: 'Name (Z–A)' }
  ];

  constructor(
    private holidayService: HolidayService,
    private messageDialog: MessageDialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.holidayForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays(page?: number): void {
    if (page !== undefined) this.page = page;
    this.loading = true;
    this.error = '';
    this.holidayService
      .getPage({ page: this.page, size: this.size, sort: this.sort })
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          const raw = data && typeof data === 'object' && 'content' in data ? data : null;
          let holidays: Holiday[] = [];
          let totalPages = 0;
          let totalElements = 0;
          if (raw && typeof raw === 'object') {
            const r = raw as { content?: unknown; totalPages?: number; totalElements?: number };
            holidays = Array.isArray(r.content) ? r.content as Holiday[] : [];
            totalPages = r.totalPages ?? 0;
            totalElements = r.totalElements ?? holidays.length;
          } else {
            holidays = Array.isArray(data) ? data as Holiday[] : [];
            totalElements = holidays.length;
          }
          const errMsg = '';
          // Defer binding updates to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError (NG0100)
          setTimeout(() => {
            this.holidays = holidays;
            this.totalPages = totalPages;
            this.totalElements = totalElements;
            this.error = errMsg;
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => {
          const errMsg = err?.message ?? err?.returnMessage ?? 'Failed to load holidays.';
          this.messageDialog.showApiError(err);
          setTimeout(() => {
            this.error = errMsg;
            this.holidays = [];
            this.totalPages = 0;
            this.totalElements = 0;
            this.cdr.detectChanges();
          }, 0);
        }
      });
  }

  onPageChange(page: number): void {
    this.loadHolidays(page);
  }

  onPageSizeChange(size: number): void {
    this.size = size;
    this.page = 0;
    this.loadHolidays(0);
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    this.page = 0;
    this.loadHolidays(0);
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
          this.loadHolidays(this.page);
          this.cancelForm();
        },
        error: (err) => {
          this.error = err?.message ?? err?.returnMessage ?? 'Save failed.';
          this.messageDialog.showApiError(err);
        }
      });
  }

  deleteHoliday(holiday: Holiday): void {
    if (holiday.id == null) return;
    if (!confirm(`Delete holiday "${holiday.name}"?`)) return;
    this.holidayService.delete(holiday.id).subscribe({
      next: () => this.loadHolidays(this.page),
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Delete failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  get f() {
    return this.holidayForm.controls;
  }
}
