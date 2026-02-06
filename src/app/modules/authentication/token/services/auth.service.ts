import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenPayload, TokenResponse, TokenTypeEnum } from '@/modules/authentication/token/models/token.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly baseUrl = environment.shippingRecords.api;
    private readonly http: HttpClient = inject(HttpClient);

    createToken(payload: TokenPayload): Observable<TokenResponse> {
        const endpoint = `${this.baseUrl}/v1/token`;
        return this.http.post<TokenResponse>(endpoint, payload);
    }

    refreshToken(refreshToken: string): Observable<TokenResponse> {
        const endpoint = `${this.baseUrl}/v1/token-refresh`;
        const config = environment.shippingRecords?.public?.config;
        const payload: TokenPayload & { refresh_token?: string } = {
            grant_type: TokenTypeEnum.REFRESH_TOKEN,
            refresh_token: refreshToken
        };
        if (config?.client_id) payload.client_id = config.client_id;
        if (config?.client_secret) payload.client_secret = config.client_secret;
        return this.http.post<TokenResponse>(endpoint, payload);
    }

    getStoredToken(): string | null {
        return sessionStorage.getItem('token');
    }

    /**
     * Valida si el token JWT aún es válido (no ha expirado)
     * @param token - Token JWT a validar (opcional, si no se proporciona se usa el token almacenado)
     * @returns true si el token es válido y no ha expirado, false en caso contrario
     */
    isTokenValid(token?: string): boolean {
        const tokenToValidate = token || this.getStoredToken();

        if (!tokenToValidate) {
            return false;
        }

        try {
            // Decodificar el payload del JWT (segunda parte del token)
            const tokenParts = tokenToValidate.split('.');
            if (tokenParts.length !== 3) {
                return false;
            }

            const payload = JSON.parse(atob(tokenParts[1]));

            // Verificar si existe el campo 'exp' (expiration time en segundos)
            if (!payload.exp) {
                return false;
            }

            // Comparar la fecha de expiración con la fecha actual
            // exp viene en segundos, Date.now() devuelve milisegundos
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > currentTime;
        } catch (error) {
            console.log(error);
            // Si hay algún error al decodificar, el token no es válido
            return false;
        }
    }
}
