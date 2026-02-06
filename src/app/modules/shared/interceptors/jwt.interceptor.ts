import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@/modules/authentication/token/services/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

// Variables para controlar el estado de la renovación
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    const token = authService.getStoredToken();
    // 1. Inyectar el token si existe
    let authReq = req;
    if (token) {
        authReq = addTokenHeader(req, token);
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 419)) {
                return handle401Error(authReq, next, authService);
            }
            return throwError(() => error);
        })
    );
};

// Función auxiliar para añadir el header
function addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
    });
}

// Lógica principal de renovación y cola
function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null); // Limpiamos el subject
        const refreshToken = sessionStorage.getItem('refresh_token') ?? '';
        return authService.refreshToken(refreshToken).pipe(
            switchMap((res) => {
                isRefreshing = false;
                const newToken = res.access_token;
                sessionStorage.setItem('token', newToken);
                sessionStorage.setItem('refresh_token', res.refresh_token);
                refreshTokenSubject.next(newToken); // Notificamos a las peticiones en cola

                return next(addTokenHeader(request, newToken));
            }),
            catchError((err) => {
                isRefreshing = false;
                // authService.logout(); // Si el refresh falla, sesión terminada
                return throwError(() => err);
            })
        );
    } else {
        // Si ya se está refrescando, esperamos a que el subject emita el nuevo token
        return refreshTokenSubject.pipe(
            filter((token) => token !== null), // Bloqueamos hasta que haya un token
            take(1), // Tomamos solo el primero y cerramos suscripción
            switchMap((token) => next(addTokenHeader(request, token!)))
        );
    }
}
