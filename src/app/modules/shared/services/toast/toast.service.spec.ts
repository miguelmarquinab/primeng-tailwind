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

    it('should emit a toast when showToast is called', (done) => {
        const expected: Toast = {
            detail: 'Mensaje',
            severity: 'success',
            summary: 'Alerta de Sistema'
        };
        service.toast$.subscribe((toast) => {
            if (toast) {
                expect(toast).toEqual(expected);
                done();
            }
        });
        service.showToast('Mensaje', 'success');
    });

    it('should emit a toast with custom summary', (done) => {
        const expected: Toast = {
            detail: 'Mensaje',
            severity: 'info',
            summary: 'Personalizado'
        };
        service.toast$.subscribe((toast) => {
            if (toast) {
                expect(toast).toEqual(expected);
                done();
            }
        });
        service.showToast('Mensaje', 'info', 'Personalizado');
    });

    it('should emit null when clearToast is called', (done) => {
        service.toast$.subscribe((toast) => {
            if (toast === null) {
                expect(toast).toBeNull();
                done();
            }
        });
        service.clearToast();
    });
});
