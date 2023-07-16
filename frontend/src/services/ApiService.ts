import {
  AuthenticateApi, BalanceApi, Configuration, PointofsaleApi, ProductCategoriesApi, UsersApi,
} from '@sudosos/sudosos-client';
import axios, { AxiosResponse } from 'axios';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import {useAuthStore} from "@/stores/auth.store";

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

  constructor() {
    const configuration = new Configuration({ basePath: import.meta.env.VITE_APP_API_BASE });
    const withKeyConfiguration = new Configuration({
      basePath: import.meta.env.VITE_APP_API_BASE,
      baseOptions: {
        axios: axiosInstance,
      },
      apiKey: () => `Bearer ${useAuthStore().getToken()}`,
    });

    this.authenticateApi = new AuthenticateApi(configuration);
    this.balanceApi = new BalanceApi(withKeyConfiguration);
    this.usersApi = new UsersApi(withKeyConfiguration);
    this.posApi = new PointofsaleApi(withKeyConfiguration);
    this.categoryApi = new ProductCategoriesApi(withKeyConfiguration);
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

  get categories() {
    this.categoryApi.getAllProductCategories()
    return this.categoryApi;
  }

}

export default new ApiService();
