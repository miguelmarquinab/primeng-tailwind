export interface TokenPayload {
    grant_type?: string;
    username?: string;
    password?: string;
    client_id?: string;
    client_secret?: string;
}
export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type?: string;
    expires_in?: number;
}

export enum TokenTypeEnum {
    CLIENT_CREDENTIALS = 'client_credentials',
    PASSWORD = 'password',
    REFRESH_TOKEN = 'refresh_token'
}
