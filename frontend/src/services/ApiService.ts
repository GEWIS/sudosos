import {
  AuthenticateApi,
  BalanceApi,
  Configuration,
  PointofsaleApi,
  ProductCategoriesApi,
  TransactionsApi,
  UsersApi,
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
class ApiService {
  private readonly authenticateApi: AuthenticateApi;

  private readonly balanceApi: BalanceApi;

  private readonly usersApi: UsersApi;

  private readonly posApi: PointofsaleApi;

  private readonly categoryApi: ProductCategoriesApi;
  private readonly transactionApi: TransactionsApi;

  constructor(basePath: string, apiKey: () => string) {
    const configuration = new Configuration({ basePath });
    const withKeyConfiguration = new Configuration({
      basePath,
      baseOptions: {
        axios: axiosInstance,
      },
      apiKey,
    });

    this.authenticateApi = new AuthenticateApi(configuration);
    this.balanceApi = new BalanceApi(withKeyConfiguration);
    this.usersApi = new UsersApi(withKeyConfiguration);
    this.posApi = new PointofsaleApi(withKeyConfiguration);
    this.categoryApi = new ProductCategoriesApi(withKeyConfiguration);
    this.transactionApi = new TransactionsApi(withKeyConfiguration);
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

export default ApiService;
