import {
  PaginationMetadata,
  PaginationParams,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../types/pagination.types';

export function calculatePaginationMetadata(
  page: number,
  limit: number,
  total: number,
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function createPaginationParams(page: number): PaginationParams {
  const limit = DEFAULT_LIMIT;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function getValidPage(pageParam?: string): number {
  return Math.max(1, parseInt(pageParam || '') || DEFAULT_PAGE);
}
