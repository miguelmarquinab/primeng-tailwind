import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Toast } from '@shared/models/toast.model';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private readonly toastSubject = new Subject<Toast | null>();

    get toast$(): Observable<Toast | null> {
        return this.toastSubject.asObservable();
    }

    showToast(detail: string, severity: 'success' | 'error' | 'info' | 'warn', summary = 'Alerta de Sistema') {
        this.toastSubject.next({ detail, severity, summary });
    }

    clearToast() {
        this.toastSubject.next(null);
    }
}
