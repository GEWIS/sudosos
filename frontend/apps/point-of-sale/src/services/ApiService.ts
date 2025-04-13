import { ApiService } from '@sudosos/sudosos-frontend-common';

const apiService = new ApiService(window.location.origin + '/api/v1');
export default apiService;
