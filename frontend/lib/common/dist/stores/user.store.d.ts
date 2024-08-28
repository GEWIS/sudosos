import { BalanceResponse, PaginatedBaseTransactionResponse, PaginatedFinancialMutationResponse, UserResponse, RoleWithPermissionsResponse } from '@sudosos/sudosos-client';
import { ApiService } from '../services/ApiService';

interface CurrentState {
    balance: BalanceResponse | null;
    user: UserResponse | null;
    rolesWithPermissions: RoleWithPermissionsResponse[];
    financialMutations: PaginatedFinancialMutationResponse;
    createdTransactions: PaginatedBaseTransactionResponse;
}
interface UserModuleState {
    users: UserResponse[];
    organs: UserResponse[];
    current: CurrentState;
}
export declare const useUserStore: import('pinia').StoreDefinition<"user", UserModuleState, {
    getUserById: (state: UserModuleState) => (userId: number) => UserResponse | undefined;
    getActiveUsers(): UserResponse[];
    getDeletedUsers(): UserResponse[];
    getCurrentUser(): CurrentState;
}, {
    fetchUsers(service: ApiService): Promise<void>;
    fetchAllOrgans(apiService: ApiService): Promise<{
        id: number;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        version?: number | undefined;
        firstName: string;
        lastName: string;
        nickname?: string | undefined;
        active: boolean;
        deleted: boolean;
        type: string;
        email?: string | undefined;
        acceptedToS?: string | undefined;
        extensiveDataProcessing?: boolean | undefined;
        ofAge?: boolean | undefined;
        canGoIntoDebt: boolean;
    }[]>;
    fetchCurrentUserBalance(id: number, service: ApiService): Promise<void>;
    fetchUserRolesWithPermissions(id: number, service: ApiService): Promise<void>;
    fetchUsersFinancialMutations(id: number, service: ApiService, take?: number, skip?: number): Promise<void>;
    fetchUserCreatedTransactions(id: number, service: ApiService, take?: number, skip?: number): Promise<void>;
    setCurrentUser(user: UserResponse): void;
    setCurrentRolesWithPermissions(rolesWithPermissions: RoleWithPermissionsResponse[]): void;
    addUser(user: UserResponse): void;
    clearCurrent(): void;
    deleteUser(id: number): void;
}>;
export {};
