import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { DepartmentService } from '../../core/services/department.service';
import { Department } from '../../models/department.model';
import {
  ReportType,
  AttendanceReportRow,
  LeaveReportRow,
  OvertimeReportRow,
  ClaimReportRow,
  EmployeeSummaryRow
} from '../../models/report.model';
import { LoadingComponent } from '../../shared/loading/loading.component';

type ReportRow = AttendanceReportRow | LeaveReportRow | OvertimeReportRow | ClaimReportRow | EmployeeSummaryRow;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reportForm: FormGroup;
  reportTypes: { value: ReportType; label: string }[] = [
    { value: 'attendance', label: 'Attendance' },
    { value: 'leave', label: 'Leave' },
    { value: 'overtime', label: 'Overtime' },
    { value: 'claim', label: 'Claim' },
    { value: 'employee-summary', label: 'Employee Summary' }
  ];
  departments: Department[] = [];
  selectedReportType: ReportType = 'attendance';
  reportData: ReportRow[] = [];
  loading = false;
  loadingDepartments = false;
  loadingExport = false;
  error = '';
  reportGenerated = false;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef
  ) {
    this.reportForm = this.fb.group({
      startDate: [this.getDefaultStartDate()],
      endDate: [this.getDefaultEndDate()],
      departmentId: [null as number | null]
    });
  }

  private getDefaultStartDate(): string {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loadingDepartments = true;
    this.departmentService.getAllDepartments({ page: 0, size: 200, sort: 'name,asc' }).subscribe({
      next: (res) => {
        this.departments = res?.content ?? [];
        this.loadingDepartments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingDepartments = false;
        this.cdr.detectChanges();
      }
    });
  }

  get requiresDateRange(): boolean {
    return this.selectedReportType !== 'employee-summary';
  }

  get reportTitle(): string {
    const titles: Record<ReportType, string> = {
      'attendance': 'Attendance Report',
      'leave': 'Leave Report',
      'overtime': 'Overtime Report',
      'claim': 'Claim Report',
      'employee-summary': 'Employee Summary Report'
    };
    return titles[this.selectedReportType] ?? 'Report';
  }

  onReportTypeChange(type: ReportType): void {
    this.selectedReportType = type;
    this.reportGenerated = false;
    this.reportData = [];
    this.error = '';
    this.cdr.detectChanges();
  }

  private normalizeToArray(value: unknown): ReportRow[] {
    if (Array.isArray(value)) return value as ReportRow[];
    if (value && typeof value === 'object' && 'data' in value) {
      const d = (value as { data: unknown }).data;
      if (Array.isArray(d)) return d as ReportRow[];
    }
    return [];
  }

  generateReport(): void {
    this.error = '';
    if (this.requiresDateRange) {
      const { startDate, endDate } = this.reportForm.value;
      if (!startDate || !endDate) {
        this.error = 'Please select start and end date.';
        this.cdr.detectChanges();
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        this.error = 'Start date must be before end date.';
        this.cdr.detectChanges();
        return;
      }
    }

    this.loading = true;
    this.reportGenerated = true;
    const departmentId = this.reportForm.value.departmentId || undefined;

    const run = () => {
      switch (this.selectedReportType) {
        case 'attendance':
          this.reportService
            .getAttendanceReport(this.reportForm.value.startDate, this.reportForm.value.endDate, departmentId)
            .subscribe(this.handleReportResult());
          break;
        case 'leave':
          this.reportService
            .getLeaveReport(this.reportForm.value.startDate, this.reportForm.value.endDate, departmentId)
            .subscribe(this.handleReportResult());
          break;
        case 'overtime':
          this.reportService
            .getOvertimeReport(this.reportForm.value.startDate, this.reportForm.value.endDate, departmentId)
            .subscribe(this.handleReportResult());
          break;
        case 'claim':
          this.reportService
            .getClaimReport(this.reportForm.value.startDate, this.reportForm.value.endDate, departmentId)
            .subscribe(this.handleReportResult());
          break;
        case 'employee-summary':
          this.reportService.getEmployeeSummaryReport(departmentId).subscribe(this.handleReportResult());
          break;
      }
    };
    run();
  }

  private handleReportResult() {
    return {
      next: (res: unknown) => {
        this.reportData = this.normalizeToArray(res);
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: (err: { message?: string; returnMessage?: string }) => {
        this.loading = false;
        this.error = err?.message ?? err?.returnMessage ?? 'Failed to load report.';
        this.reportData = [];
        this.cdr.detectChanges();
      }
    };
  }

  get attendanceRows(): AttendanceReportRow[] {
    return this.reportData as AttendanceReportRow[];
  }

  get leaveRows(): LeaveReportRow[] {
    return this.reportData as LeaveReportRow[];
  }

  get overtimeRows(): OvertimeReportRow[] {
    return this.reportData as OvertimeReportRow[];
  }

  get claimRows(): ClaimReportRow[] {
    return this.reportData as ClaimReportRow[];
  }

  get employeeSummaryRows(): EmployeeSummaryRow[] {
    return this.reportData as EmployeeSummaryRow[];
  }

  private validateExportParams(): boolean {
    if (this.requiresDateRange) {
      const { startDate, endDate } = this.reportForm.value;
      if (!startDate || !endDate) {
        this.error = 'Please select start and end date before exporting.';
        this.cdr.detectChanges();
        return false;
      }
      if (new Date(startDate) > new Date(endDate)) {
        this.error = 'Start date must be before end date.';
        this.cdr.detectChanges();
        return false;
      }
    }
    return true;
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private getExportFilename(format: 'xlsx' | 'pdf'): string {
    return `${this.selectedReportType}-report.${format}`;
  }

  exportExcel(): void {
    if (!this.validateExportParams()) return;
    this.loadingExport = true;
    this.error = '';
    const { startDate, endDate, departmentId } = this.reportForm.value;
    const deptId = departmentId || undefined;
    this.reportService
      .exportExcel(this.selectedReportType, startDate, endDate, deptId)
      .subscribe({
        next: (blob) => {
          this.triggerDownload(blob, this.getExportFilename('xlsx'));
          this.loadingExport = false;
          this.cdr.detectChanges();
        },
        error: (err: { message?: string; returnMessage?: string }) => {
          this.loadingExport = false;
          this.error = err?.message ?? err?.returnMessage ?? 'Export failed.';
          this.cdr.detectChanges();
        }
      });
  }

  exportPdf(): void {
    if (!this.validateExportParams()) return;
    this.loadingExport = true;
    this.error = '';
    const { startDate, endDate, departmentId } = this.reportForm.value;
    const deptId = departmentId || undefined;
    this.reportService
      .exportPdf(this.selectedReportType, startDate, endDate, deptId)
      .subscribe({
        next: (blob) => {
          this.triggerDownload(blob, this.getExportFilename('pdf'));
          this.loadingExport = false;
          this.cdr.detectChanges();
        },
        error: (err: { message?: string; returnMessage?: string }) => {
          this.loadingExport = false;
          this.error = err?.message ?? err?.returnMessage ?? 'Export failed.';
          this.cdr.detectChanges();
        }
      });
  }
}
