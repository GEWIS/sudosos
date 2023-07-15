import {
  AuthenticateApi, BalanceApi, Configuration, UsersApi,
} from 'sudosos-client';
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

  private jwtToken: string | undefined;

  constructor() {
    const configuration = new Configuration({ basePath: process.env.VUE_APP_API_BASE });
    const withKeyConfiguration = new Configuration({
      basePath: process.env.VUE_APP_API_BASE,
      baseOptions: {
        axios: axiosInstance,
      },
      apiKey: () => `Bearer ${this.jwtToken}`,
    });

    this.authenticateApi = new AuthenticateApi(configuration);
    this.balanceApi = new BalanceApi(withKeyConfiguration);
    this.usersApi = new UsersApi(withKeyConfiguration);
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

  setJwtToken(jwtToken: string | undefined) {
    this.jwtToken = jwtToken;
  }
}

export default new ApiService();
