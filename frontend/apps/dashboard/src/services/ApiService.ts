import { createApiService } from '@sudosos/sudosos-frontend-common';
const apiService = createApiService(window.location.origin + '/api/v1');
export default apiService;

export const DEFAULT_PAGINATION_MAX = 500;
