export interface AuthUser {
    username: string;
    roles: string[];
}

export interface LoginRequestBody {
    username?: string;
    password?: string;
}

export interface AuthSessionResponse {
    user: AuthUser;
}

export interface LoginErrorResponse {
    error: string;
}
