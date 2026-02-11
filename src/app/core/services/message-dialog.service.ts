import { Injectable, signal, computed } from '@angular/core';

export type MessageDialogType = 'success' | 'error';

export interface MessageDialogState {
  visible: boolean;
  type: MessageDialogType;
  message: string;
  detail?: string;
}

/**
 * Utility service to show success/error dialogs from backend API responses.
 * Use showApiError(err) to display returnMessage and data (e.g. parse errors) from responses like:
 * { "returnCode": "500", "returnMessage": "An unexpected error occurred.", "data": "..." }
 */
@Injectable({
  providedIn: 'root'
})
export class MessageDialogService {
  private readonly state = signal<MessageDialogState>({
    visible: false,
    type: 'success',
    message: '',
    detail: undefined
  });

  readonly dialogState = computed(() => this.state());

  showSuccess(message: string, detail?: string): void {
    this.state.set({
      visible: true,
      type: 'success',
      message,
      detail: detail || undefined
    });
  }

  showError(message: string, detail?: string): void {
    this.state.set({
      visible: true,
      type: 'error',
      message,
      detail: detail || undefined
    });
  }

  /**
   * Show error from backend API response or normalized error object.
   * Handles: { returnCode, returnMessage, data } and { message?, returnMessage?, error?: { returnMessage?, data? } }
   */
  showApiError(response: unknown): void {
    const { message, detail } = this.parseApiResponse(response);
    this.showError(message, detail);
  }

  /**
   * Parse backend-style response into message and optional detail.
   * - returnMessage (or message) -> message
   * - data (if string) -> detail
   */
  parseApiResponse(response: unknown): { message: string; detail?: string } {
    if (response == null || typeof response !== 'object') {
      return { message: 'An unexpected error occurred.' };
    }
    const obj = response as Record<string, unknown>;
    const body = obj['error'] && typeof obj['error'] === 'object' ? (obj['error'] as Record<string, unknown>) : obj;
    const bodyObj = body as Record<string, unknown>;
    const message =
      (bodyObj['message'] as string) ??
      (bodyObj['returnMessage'] as string) ??
      (obj['message'] as string) ??
      (obj['returnMessage'] as string) ??
      'An unexpected error occurred.';
    const data = bodyObj['data'] ?? obj['data'];
    const detail = typeof data === 'string' ? data : undefined;
    return { message, detail };
  }

  close(): void {
    this.state.update((s) => ({ ...s, visible: false }));
  }
}
