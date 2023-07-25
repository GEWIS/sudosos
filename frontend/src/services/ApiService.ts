import {
    AuthenticateApi,
    BalanceApi, BannersApi, BorrelkaartgroupsApi,
    Configuration, ContainersApi, FilesApi, InvoicesApi, PayoutRequestsApi,
    PointofsaleApi,
    ProductCategoriesApi, ProductsApi, RbacApi, RootApi, StripeApi,
    TransactionsApi, TransfersApi,
    UsersApi, VatGroupsApi,
} from '@sudosos/sudosos-client';
import axios, { AxiosResponse } from 'axios';
import jwtDecode, { JwtPayload } from 'jwt-decode';

// Create an axios instance
const axiosInstance = axios.create();

function setTokenInStorage(jwtToken: string) {
    localStorage.setItem('jwt_expires', String(Number(jwtDecode<JwtPayload>(jwtToken).exp) * 1000));
    localStorage.setItem('jwt_token', jwtToken);
}

// Add a response interceptor to the axios instance
axiosInstance.interceptors.response.use((response: AxiosResponse) => {
    if (response.headers['Set-Authorization']) {
        const newToken = response.headers['Set-Authorization'];
        setTokenInStorage(newToken);
    }

    return response;
});

export class ApiService {

    private readonly _authenticateApi: AuthenticateApi;

    private readonly _balanceApi: BalanceApi;

    private readonly _usersApi: UsersApi;

    private readonly _posApi: PointofsaleApi;

    private readonly _categoryApi: ProductCategoriesApi;

    private readonly _transactionApi: TransactionsApi;

    private readonly _bannerApi: BannersApi;

    private readonly _rootApi: RootApi

    private readonly _borrelkaartApi: BorrelkaartgroupsApi;

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


    constructor(basePath: string, apiKey: () => string) {
        const configuration = new Configuration({ basePath });
        const withKeyConfiguration = new Configuration({
            basePath,
            baseOptions: {
                axios: axiosInstance,
            },
            apiKey,
        });

        this._authenticateApi = new AuthenticateApi(configuration);
        this._balanceApi = new BalanceApi(withKeyConfiguration);
        this._usersApi = new UsersApi(withKeyConfiguration);
        this._posApi = new PointofsaleApi(withKeyConfiguration);
        this._categoryApi = new ProductCategoriesApi(withKeyConfiguration);
        this._transactionApi = new TransactionsApi(withKeyConfiguration);
        this._bannerApi = new BannersApi(withKeyConfiguration);
        this._openBannerApi = new BannersApi(configuration);
        this._rootApi = new RootApi();
        this._borrelkaartApi = new BorrelkaartgroupsApi(withKeyConfiguration);
        this._containerApi = new ContainersApi(withKeyConfiguration);
        this._filesApi = new FilesApi(withKeyConfiguration);
        this._invoicesApi = new InvoicesApi(withKeyConfiguration);
        this._payoutsApi = new PayoutRequestsApi(withKeyConfiguration);
        this._productsApi = new ProductsApi(withKeyConfiguration);
        this._transfersApi = new TransfersApi(withKeyConfiguration);
        this._vatGroupsApi = new VatGroupsApi(withKeyConfiguration);
        this._stripeApi = new StripeApi(withKeyConfiguration);
        this._rbacApi = new RbacApi(withKeyConfiguration);
    }

    get authenticate(): AuthenticateApi {
        return this._authenticateApi;
    }

    get balance(): BalanceApi {
        return this._balanceApi;
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

    get borrelkaart(): BorrelkaartgroupsApi {
        return this._borrelkaartApi;
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

    get categories(): ProductCategoriesApi {
        return this._categoryApi;
    }

    get borrelKaart(): BorrelkaartgroupsApi {
        return this._borrelkaartApi;
    }

    get openBanner(): BannersApi {
        return this._openBannerApi;
    }

}
