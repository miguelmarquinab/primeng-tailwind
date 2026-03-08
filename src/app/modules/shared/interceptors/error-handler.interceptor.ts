import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/services/toast/toast.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let message = 'Ocurrió un error inesperado';

            console.log(error);
            switch (error.status) {
                case 0:
                    message = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
                    break;
                case 400:
                    message = error.error?.detail ?? 'La solicitud contiene datos inválidos.';
                    break;
                case 401:
                  message = '';
                  // message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
                  break;
                case 403:
                    message = 'No tienes permisos para realizar esta acción.';
                    break;
                case 404:
                    message = error.error?.detail ?? 'El recurso solicitado no fue encontrado.';
                    break;
                case 409:
                    message = error.error?.detail ?? 'Conflicto con el estado actual del recurso.';
                    break;
                case 422:
                    message = error.error?.detail ?? 'Los datos enviados no son válidos.';
                    break;
                case 429:
                    message = 'Demasiadas solicitudes. Intenta de nuevo en unos momentos.';
                    break;
                case 500:
                    message = 'Error interno del servidor. Intenta más tarde.';
                    break;
                case 502:
                case 503:
                case 504:
                    message = 'El servicio no está disponible en este momento. Intenta más tarde.';
                    break;
            }

            console.log(message);

            if(message){
                toastService.showToast(message, 'error', 'Error');

            }

            return throwError(() => error);
        })
    );
};
