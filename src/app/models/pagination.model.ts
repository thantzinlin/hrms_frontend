/** Spring Page response shape (from backend). */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements?: number;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}
