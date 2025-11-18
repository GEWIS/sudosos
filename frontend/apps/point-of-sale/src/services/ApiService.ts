import { createApiService, createPosApiService } from '@sudosos/sudosos-frontend-common';

const userApiService = createApiService(window.location.origin + '/api/v1');

const posApiService = createPosApiService(window.location.origin + '/api/v1');

export default posApiService;
export { userApiService, posApiService };
