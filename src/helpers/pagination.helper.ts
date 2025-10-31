import {
  PaginationMetadata,
  PaginationParams,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  FIRST_PAGE,
  MINIMUM_PAGE,
  MINIMUM_LIMIT,
} from '../types/pagination.types';

function getValidLimit(limit: number): number {
  return Math.max(MINIMUM_LIMIT, limit);
}

export function calculatePaginationMetadata(
  page: number,
  limit: number,
  total: number,
): PaginationMetadata {
  const validLimit = getValidLimit(limit);
  const totalPages = Math.ceil(total / validLimit);

  return {
    page,
    limit: validLimit,
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
  const validLimit = getValidLimit(limit);
  const offset = (page - FIRST_PAGE) * validLimit;
  return { page, limit: validLimit, offset };
}

export function getValidPage(pageParam?: string): number {
  return Math.max(MINIMUM_PAGE, parseInt(pageParam || '') || DEFAULT_PAGE);
}
