declare class ApiService {
    private readonly authenticateApi;
    private readonly balanceApi;
    private readonly usersApi;
    private readonly posApi;
    private readonly categoryApi;
    private readonly transactionApi;
    private _apiKey;
    private _basePath;
    constructor();
    set basePath(basePath: string);
    set apiKey(apiKey: () => string);
    get authenticate(): AuthenticateApi;
    get balance(): BalanceApi;
    get user(): UsersApi;
    get pos(): PointofsaleApi;
    get transaction(): TransactionsApi;
    get categories(): ProductCategoriesApi;
}
declare const _default: ApiService;
export default _default;
