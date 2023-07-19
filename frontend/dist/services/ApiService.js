"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sudosos_client_1 = require("@sudosos/sudosos-client");
const axios_1 = require("axios");
const jwt_decode_1 = require("jwt-decode");
// Create an axios instance
const axiosInstance = axios_1.default.create();
function setTokenInStorage(jwtToken) {
    localStorage.setItem('jwt_expires', String(Number((0, jwt_decode_1.default)(jwtToken).exp) * 1000));
    localStorage.setItem('jwt_token', jwtToken);
}
// Add a response interceptor to the axios instance
axiosInstance.interceptors.response.use((response) => {
    if (response.headers['Set-Authorization']) {
        const newToken = response.headers['Set-Authorization'];
        setTokenInStorage(newToken);
    }
    return response;
});
class ApiService {
    constructor(basePath, apiKey) {
        const configuration = new sudosos_client_1.Configuration({ basePath });
        const withKeyConfiguration = new sudosos_client_1.Configuration({
            basePath,
            baseOptions: {
                axios: axiosInstance,
            },
            apiKey,
        });
        this.authenticateApi = new sudosos_client_1.AuthenticateApi(configuration);
        this.balanceApi = new sudosos_client_1.BalanceApi(withKeyConfiguration);
        this.usersApi = new sudosos_client_1.UsersApi(withKeyConfiguration);
        this.posApi = new sudosos_client_1.PointofsaleApi(withKeyConfiguration);
        this.categoryApi = new sudosos_client_1.ProductCategoriesApi(withKeyConfiguration);
        this.transactionApi = new sudosos_client_1.TransactionsApi(withKeyConfiguration);
    }
    get authenticate() {
        return this.authenticateApi;
    }
    get balance() {
        return this.balanceApi;
    }
    get user() {
        return this.usersApi;
    }
    get pos() {
        return this.posApi;
    }
    get transaction() {
        return this.transactionApi;
    }
    get categories() {
        return this.categoryApi;
    }
}
exports.default = ApiService;
//# sourceMappingURL=ApiService.js.map