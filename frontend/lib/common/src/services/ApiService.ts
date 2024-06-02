import {
    AuthenticateApi,
    BalanceApi,
    BannersApi,
    VouchergroupsApi,
    Configuration,
    ContainersApi,
    FilesApi,
    InvoicesApi,
    PayoutRequestsApi,
    PointofsaleApi,
    ProductCategoriesApi,
    ProductsApi,
    RbacApi,
    RootApi,
    StripeApi,
    TransactionsApi,
    TransfersApi,
    UsersApi,
    VatGroupsApi, DebtorsApi,
} from '@sudosos/sudosos-client';
import axios, { AxiosInstance } from "axios";
import { AxiosResponse } from "axios";
import { getTokenFromStorage, updateTokenIfNecessary } from "../helpers/TokenHelper";

// Create an axios instance
const axiosInstance: AxiosInstance = axios.create();

// Add a response interceptor to the axios instance
axiosInstance.interceptors.response.use((response: AxiosResponse) => {
    updateTokenIfNecessary(response);
    return response;
});

export class ApiService {

    private readonly _authenticateApi: AuthenticateApi;

    private readonly _balanceApi: BalanceApi;

    private readonly _debtorsApi: DebtorsApi

    private readonly _usersApi: UsersApi;

    private readonly _posApi: PointofsaleApi;

    private readonly _categoryApi: ProductCategoriesApi;

    private readonly _transactionApi: TransactionsApi;

    private readonly _bannerApi: BannersApi;

    private readonly _rootApi: RootApi;

    private readonly _voucherGroupApi: VouchergroupsApi;

    private readonly _containerApi: ContainersApi;

    private readonly _filesApi: FilesApi;

    private readonly _invoicesApi: InvoicesApi;

    private readonly _payoutsApi: PayoutRequestsApi;

    private readonly _productsApi: ProductsApi;

    private readonly _transfersApi: TransfersApi;

    private readonly _vatGroupsApi: VatGroupsApi;

    private readonly _stripeApi: StripeApi;

    private readonly _rbacApi: RbacApi;

    private readonly _openBannerApi: BannersApi;

    constructor(basePath: string) {
        const withKeyConfiguration = new Configuration({
            accessToken: () => getTokenFromStorage().token,
        });

        this._authenticateApi = new AuthenticateApi(withKeyConfiguration, basePath, axiosInstance);
        this._balanceApi = new BalanceApi(withKeyConfiguration, basePath, axiosInstance);
        this._debtorsApi = new DebtorsApi(withKeyConfiguration, basePath, axiosInstance);
        this._usersApi = new UsersApi(withKeyConfiguration, basePath, axiosInstance);
        this._posApi = new PointofsaleApi(withKeyConfiguration, basePath, axiosInstance);
        this._categoryApi = new ProductCategoriesApi(withKeyConfiguration, basePath, axiosInstance);
        this._transactionApi = new TransactionsApi(withKeyConfiguration, basePath, axiosInstance);
        this._bannerApi = new BannersApi(withKeyConfiguration, basePath, axiosInstance);
        this._openBannerApi = new BannersApi(undefined, basePath, axiosInstance);
        this._rootApi = new RootApi();
        this._voucherGroupApi = new VouchergroupsApi(withKeyConfiguration, basePath, axiosInstance);
        this._containerApi = new ContainersApi(withKeyConfiguration, basePath, axiosInstance);
        this._filesApi = new FilesApi(withKeyConfiguration, basePath, axiosInstance);
        this._invoicesApi = new InvoicesApi(withKeyConfiguration, basePath, axiosInstance);
        this._payoutsApi = new PayoutRequestsApi(withKeyConfiguration, basePath, axiosInstance);
        this._productsApi = new ProductsApi(withKeyConfiguration, basePath, axiosInstance);
        this._transfersApi = new TransfersApi(withKeyConfiguration, basePath, axiosInstance);
        this._vatGroupsApi = new VatGroupsApi(withKeyConfiguration, basePath, axiosInstance);
        this._stripeApi = new StripeApi(withKeyConfiguration, basePath, axiosInstance);
        this._rbacApi = new RbacApi(withKeyConfiguration, basePath, axiosInstance);
    }

    get authenticate(): AuthenticateApi {
        return this._authenticateApi;
    }

    get balance(): BalanceApi {
        return this._balanceApi;
    }

    get debtor(): DebtorsApi {
        return this._debtorsApi;
    }

    get pos(): PointofsaleApi {
        return this._posApi;
    }

    get category(): ProductCategoriesApi {
        return this._categoryApi;
    }

    get transaction(): TransactionsApi {
        return this._transactionApi;
    }

    get banner(): BannersApi {
        return this._bannerApi;
    }

    get rootApi(): RootApi {
        return this._rootApi;
    }

    get borrelkaart(): VouchergroupsApi {
        return this._voucherGroupApi;
    }

    get container(): ContainersApi {
        return this._containerApi;
    }

    get files(): FilesApi {
        return this._filesApi;
    }

    get invoices(): InvoicesApi {
        return this._invoicesApi;
    }

    get payouts(): PayoutRequestsApi {
        return this._payoutsApi;
    }

    get products(): ProductsApi {
        return this._productsApi;
    }

    get transfers(): TransfersApi {
        return this._transfersApi;
    }

    get vatGroups(): VatGroupsApi {
        return this._vatGroupsApi;
    }

    get stripe(): StripeApi {
        return this._stripeApi;
    }

    get rbac(): RbacApi {
        return this._rbacApi;
    }

    get user(): UsersApi {
        return this._usersApi;
    }

    get openBanner(): BannersApi {
        return this._openBannerApi;
    }

}
