import { Injectable, signal, Signal } from '@angular/core';
import { Toast } from '@shared/models/toast.model';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    // Señal interna que mantiene el estado actual del toast
    private readonly _toast = signal<Toast | null>(null);

    // API pública basada en Signal (readonly)
    get toastSignal(): Signal<Toast | null> {
        return this._toast.asReadonly();
    }

    showToast(detail: string, severity: 'success' | 'error' | 'info' | 'warn', summary = 'Alerta de Sistema') {
        const toast: Toast = { detail, severity, summary };
        this._toast.set(toast);
    }

    clearToast() {
        this._toast.set(null);
    }
}
