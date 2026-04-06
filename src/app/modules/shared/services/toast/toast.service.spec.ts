import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { Toast } from '@shared/models/toast.model';

describe('ToastService', () => {
    let service: ToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ToastService]
        });
        service = TestBed.inject(ToastService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set a toast when showToast is called', () => {
        const expected: Toast = {
            detail: 'Mensaje',
            severity: 'success',
            summary: 'Alerta de Sistema'
        };
        service.showToast('Mensaje', 'success');
        expect(service.toastSignal()).toEqual(expected);
    });

    it('should set a toast with custom summary', () => {
        const expected: Toast = {
            detail: 'Mensaje',
            severity: 'info',
            summary: 'Personalizado'
        };
        service.showToast('Mensaje', 'info', 'Personalizado');
        expect(service.toastSignal()).toEqual(expected);
    });

    it('should be null when clearToast is called', () => {
        service.clearToast();
        expect(service.toastSignal()).toBeNull();
    });
});
