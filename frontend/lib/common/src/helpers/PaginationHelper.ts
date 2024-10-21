import type { AxiosResponse } from 'axios';

interface PaginationResult<T> {
  _pagination: {
    count: number;
    skip: number;
    take: number;
  };
  records: T[];
}

/**
 * Fetches all pages of data from a paginated API endpoint.
 *
 * @template T - The type of data returned by the API endpoint.
 * @param {(take: number, skip: number) => Promise<T[]>} fetchPage -
 *    A function that returns a promise with the data for a specific page.
 * @returns {Promise<T[]>} - A promise that resolves to an array of all the fetched data.
 *
 * @example
 * // Fetch all pages of users from the API
 * const fetchAllUsers = async (service) => {
 *   const users = await fetchAllPages<UserResponse>((take, skip) => service.user.getAllUsers(take, skip));
 *   return users;
 * };
 */
export async function fetchAllPages<T>(
  fetchPage: (take: number, skip: number) => Promise<AxiosResponse<PaginationResult<T>>>,
): Promise<T[]> {
  let skip = 0;
  const take = Number.MAX_SAFE_INTEGER;
  let allData: T[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await fetchPage(take, skip);
    const { records, _pagination } = response.data;
    allData = allData.concat(records);
    skip += _pagination.take;

    if (response.data._pagination.count <= skip) {
      // Reached the last page, exit the loop
      break;
    }
  }

  return allData;
}
