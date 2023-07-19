import { AxiosResponse } from 'axios';

interface PaginationResult<T> {
  _pagination: {
    count: number;
    skip: number;
  };
  records: T[];
}

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

    if (response.data._pagination.count <= skip) {
      // Reached the last page, exit the loop
      break;
    }

    allData = allData.concat(records);
    skip += take;
  }

  return allData;
}
