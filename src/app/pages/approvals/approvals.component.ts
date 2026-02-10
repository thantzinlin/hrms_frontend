import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalService } from '../../core/services/approval.service';
import { PendingApprovalItem } from '../../models/approval.model';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css']
})
export class ApprovalsComponent implements OnInit {
  pending: PendingApprovalItem[] = [];
  loading = false;
  error = '';
  actionLoadingId: string | null = null;
  remarksMap: Record<string, string> = {};

  constructor(
    private approvalService: ApprovalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.error = '';
    this.approvalService.getPending().subscribe({
      next: (data) => {
        this.pending = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Failed to load pending approvals.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRemarks(id: string): string {
    return this.remarksMap[id] ?? '';
  }

  setRemarks(id: string, value: string): void {
    this.remarksMap[id] = value;
  }

  approve(item: PendingApprovalItem): void {
    this.actionLoadingId = item.id;
    this.error = '';
    const remarks = this.getRemarks(item.id);
    this.approvalService.approveById(item.id, { remarks }).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.setRemarks(item.id, '');
        this.loadPending();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Approve failed.';
        this.actionLoadingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  reject(item: PendingApprovalItem): void {
    this.actionLoadingId = item.id;
    this.error = '';
    const remarks = this.getRemarks(item.id);
    this.approvalService.rejectById(item.id, { remarks }).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.setRemarks(item.id, '');
        this.loadPending();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Reject failed.';
        this.actionLoadingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  isActionLoading(id: string): boolean {
    return this.actionLoadingId === id;
  }

  labelType(item: PendingApprovalItem): string {
    return item.requestType === 'LEAVE' ? 'Leave' : 'Overtime';
  }

  labelDates(item: PendingApprovalItem): string {
    if (item.requestType === 'LEAVE') {
      return `${item.startDate} – ${item.endDate ?? ''}`;
    }
    return `${item.startDate}${item.hours != null ? ` · ${item.hours} hrs` : ''}`;
  }
}
