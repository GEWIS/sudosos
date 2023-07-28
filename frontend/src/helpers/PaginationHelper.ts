import { AxiosResponse } from 'axios';

interface PaginationResult<T> {
  _pagination: {
    count: number;
    skip: number;
  };
  records: T[];
}

/**
 * Fetches all pages of data from a paginated API endpoint.
 *
 * @template T - The type of data returned by the API endpoint.
 * @param {number} take - The number of items to fetch per page.
 * @param {number} initialSkip - The number of items to skip.
 * @param {(take: number, skip: number) => Promise<T[]>} fetchPage - A function that returns a promise with the data for a specific page.
 * @returns {Promise<T[]>} - A promise that resolves to an array of all the fetched data.
 *
 * @example
 * // Fetch all pages of users from the API
 * const fetchAllUsers = async (service) => {
 *   const users = await fetchAllPages<UserResponse>(0, 500, (take, skip) => service.user.getAllUsers(take, skip));
 *   return users;
 * };
 */
export async function fetchAllPages<T>(
  initialSkip: number,
  take: number,
  fetchPage: (take: number, skip: number) => Promise<AxiosResponse<PaginationResult<T>>>,
): Promise<T[]> {
  let skip = initialSkip;
  let allData: T[] = [];
  while (true) {
    const response = await fetchPage(take, skip);
    const { records } = response.data;
    allData = allData.concat(records);
    skip += take;

    if (response.data._pagination.count <= (skip + take)) {
      // Reached the last page, exit the loop
      break;
    }
  }

  return allData;
}
