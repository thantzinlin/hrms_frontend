import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ClaimService } from '../../../core/services/claim.service';
import { MessageDialogService } from '../../../core/services/message-dialog.service';
import { Claim, ClaimAttachment } from '../../../models/claim.model';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './claim-detail.component.html',
  styleUrls: ['./claim-detail.component.css']
})
export class ClaimDetailComponent implements OnInit {

  claim: Claim | null = null;
  loading = true;
  uploading = false;
  submitting = false;
  error = '';
  uploadForm: FormGroup;
  fileInput: HTMLInputElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private claimService: ClaimService,
    private messageDialog: MessageDialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.uploadForm = this.fb.group({
      attachmentType: ['RECEIPT']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClaim(parseInt(id, 10));
    }
  }

  loadClaim(id: number): void {
    this.loading = true;
    this.error = '';
    this.claim = null;
    this.cdr.markForCheck();
    this.claimService.getById(id).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (res) => {
        const c = res && typeof res === 'object' && 'data' in res
          ? (res as { data: Claim }).data
          : res;
        this.claim = (c && typeof c === 'object' && 'id' in c) ? c as Claim : null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Failed to load claim.';
        this.messageDialog.showApiError(err);
        this.cdr.markForCheck();
      }
    });
  }

  triggerFileInput(): void {
    this.fileInput = document.getElementById('claimFileInput') as HTMLInputElement;
    this.fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !this.claim?.id) return;

    this.uploading = true;
    this.claimService.addAttachment(
      this.claim.id,
      file,
      this.uploadForm.value.attachmentType
    ).pipe(finalize(() => { this.uploading = false; input.value = ''; })).subscribe({
      next: () => {
        this.loadClaim(this.claim!.id!);
        this.messageDialog.showSuccess('Attachment added.');
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Upload failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  deleteAttachment(att: ClaimAttachment): void {
    if (!this.claim?.id || !att.id) return;
    if (!confirm(`Remove attachment "${att.fileName}"?`)) return;

    this.claimService.deleteAttachment(this.claim.id, att.id).subscribe({
      next: () => {
        this.loadClaim(this.claim!.id!);
        this.messageDialog.showSuccess('Attachment removed.');
      },
      error: (err) => this.messageDialog.showApiError(err)
    });
  }

  downloadAttachment(att: ClaimAttachment): void {
    if (!this.claim?.id || !att.id) return;
    this.claimService.downloadAttachment(this.claim.id, att.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = att.fileName || 'attachment';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => this.messageDialog.showApiError(err)
    });
  }

  submitForApproval(): void {
    if (!this.claim?.id || this.claim.status !== 'DRAFT') return;
    this.submitting = true;
    this.claimService.submit(this.claim.id).pipe(finalize(() => this.submitting = false)).subscribe({
      next: () => {
        this.loadClaim(this.claim!.id!);
        this.messageDialog.showSuccess('Claim submitted for approval.');
      },
      error: (err) => {
        this.error = err?.message ?? err?.returnMessage ?? 'Submit failed.';
        this.messageDialog.showApiError(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/claims']);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'APPROVED': 'bg-green-200 text-green-900',
      'REIMBURSED': 'bg-green-200 text-green-900',
      'REJECTED': 'bg-red-200 text-red-900',
      'PENDING_SUPERVISOR': 'bg-amber-200 text-amber-900',
      'PENDING_HR': 'bg-amber-200 text-amber-900',
      'DRAFT': 'bg-gray-200 text-gray-800'
    };
    return map[status] ?? 'bg-gray-200 text-gray-800';
  }
}
