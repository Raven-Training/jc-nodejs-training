import {
  PaginationMetadata,
  PaginationParams,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  FIRST_PAGE,
  MINIMUM_PAGE,
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
    hasPrev: page > FIRST_PAGE,
  };
}

export function createPaginationParams(
  page: number,
  limit: number = DEFAULT_LIMIT,
): PaginationParams {
  const offset = (page - FIRST_PAGE) * limit;
  return { page, limit, offset };
}

export function getValidPage(pageParam?: string): number {
  return Math.max(MINIMUM_PAGE, parseInt(pageParam || '') || DEFAULT_PAGE);
}
