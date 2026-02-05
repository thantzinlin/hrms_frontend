import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageDialogService } from '../../core/services/message-dialog.service';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.css']
})
export class MessageDialogComponent {
  private readonly dialogService = inject(MessageDialogService);

  readonly state = this.dialogService.dialogState;

  readonly isSuccess = computed(() => this.state().type === 'success');
  readonly isError = computed(() => this.state().type === 'error');

  close(): void {
    this.dialogService.close();
  }

  onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).hasAttribute('data-dialog-backdrop')) {
      this.close();
    }
  }
}
