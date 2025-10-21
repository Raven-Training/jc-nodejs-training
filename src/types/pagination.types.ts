export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
