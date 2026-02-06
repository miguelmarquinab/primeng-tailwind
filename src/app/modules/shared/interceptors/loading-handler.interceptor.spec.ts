import { TestBed } from '@angular/core/testing';
import { loadingHandlerInterceptor } from './loading-handler.interceptor';
import { LoadingService } from '../services/is-loading/loading.service';
import { of, throwError } from 'rxjs';
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';

describe('loadingHandlerInterceptor', () => {
    let loadingMock: any;

    beforeEach(() => {
        loadingMock = {
            show: jasmine.createSpy('show'),
            hide: jasmine.createSpy('hide')
        };

        TestBed.configureTestingModule({
            providers: [{ provide: LoadingService, useValue: loadingMock }]
        });
    });

    it('should call show and then hide on successful request', (done) => {
        const req = new HttpRequest('GET', '/test');
        const next: HttpHandlerFn = (req) => of(new HttpResponse({ status: 200 }));

        TestBed.runInInjectionContext(() => {
            const res$ = loadingHandlerInterceptor(req, next);
            res$.subscribe({
                next: () => {
                    expect(loadingMock.show).toHaveBeenCalled();
                    expect(loadingMock.hide).toHaveBeenCalled();
                    done();
                },
                error: (e) => done.fail(e)
            });
        });
    });

    it('should call show and then hide on error request', (done) => {
        const req = new HttpRequest('GET', '/test');
        const error = new Error('test error');
        const next: HttpHandlerFn = (req) => throwError(() => error);

        TestBed.runInInjectionContext(() => {
            const res$ = loadingHandlerInterceptor(req, next);
            res$.subscribe({
                next: () => done.fail('should have failed'),
                error: (e) => {
                    expect(e).toBe(error);
                    expect(loadingMock.show).toHaveBeenCalled();
                    expect(loadingMock.hide).toHaveBeenCalled();
                    done();
                }
            });
        });
    });
});
