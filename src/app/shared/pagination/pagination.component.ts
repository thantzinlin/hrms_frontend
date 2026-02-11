import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50];
  @Input() sort = '';
  @Input() sortOptions: SortOption[] = [];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<string>();

  get pageNumbers(): number[] {
    const total = this.totalPages;
    if (total <= 1) return [];
    const current = this.currentPage;
    const delta = 2;
    const left = Math.max(0, current - delta);
    const right = Math.min(total - 1, current + delta);
    const range: number[] = [];
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  }

  get isFirstPage(): boolean {
    return this.currentPage <= 0;
  }

  get isLastPage(): boolean {
    return this.totalPages <= 0 || this.currentPage >= this.totalPages - 1;
  }

  get fromItem(): number {
    return this.totalElements === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get toItem(): number {
    const to = (this.currentPage + 1) * this.pageSize;
    return Math.min(to, this.totalElements);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  prev(): void {
    if (!this.isFirstPage) this.pageChange.emit(this.currentPage - 1);
  }

  next(): void {
    if (!this.isLastPage) this.pageChange.emit(this.currentPage + 1);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const size = parseInt(select.value, 10);
    if (!isNaN(size) && size > 0) this.pageSizeChange.emit(size);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select?.value ?? '';
    if (value) this.sortChange.emit(value);
  }
}
