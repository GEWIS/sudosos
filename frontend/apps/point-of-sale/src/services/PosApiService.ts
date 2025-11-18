import { createPosApiService } from '@sudosos/sudosos-frontend-common';
const apiService = createPosApiService(window.location.origin + '/api/v1');
export default apiService;
