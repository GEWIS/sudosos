import { AuthenticateApi, BalanceApi, PointofsaleApi, ProductCategoriesApi, TransactionsApi, UsersApi } from '@sudosos/sudosos-client';
declare class ApiService {
    private readonly authenticateApi;
    private readonly balanceApi;
    private readonly usersApi;
    private readonly posApi;
    private readonly categoryApi;
    private readonly transactionApi;
    constructor(basePath: string, apiKey: () => string);
    get authenticate(): AuthenticateApi;
    get balance(): BalanceApi;
    get user(): UsersApi;
    get pos(): PointofsaleApi;
    get transaction(): TransactionsApi;
    get categories(): ProductCategoriesApi;
}
export default ApiService;
