import { AxiosResponse } from 'axios';
interface PaginationResult<T> {
    _pagination: {
        count: number;
        skip: number;
    };
    records: T[];
}
export declare function fetchAllPages<T>(initialSkip: number, take: number, fetchPage: (take: number, skip: number) => Promise<AxiosResponse<PaginationResult<T>>>): Promise<T[]>;
export {};
