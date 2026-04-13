import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { CartService } from '@shipment-record/services/cart.service';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { Subject } from 'rxjs';
import { CartEntityDataResponse } from '@shipment-record/models/cart.model';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { LoadingService } from '@shared/services/is-loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-shipping-finish',
    imports: [Button, ConfirmDialog, LoadingComponent],
    templateUrl: './shipping-finish.component.html',
    styleUrl: './shipping-finish.component.scss',
    providers: [ConfirmationService]
})
export class ShippingFinishComponent implements OnInit, OnDestroy {
    private readonly cartService = inject(CartService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly destroy$ = new Subject<void>();
    private readonly loadingService: LoadingService = inject(LoadingService);
    private readonly router: Router = inject(Router);

    loading = this.loadingService.loading;

    private readonly destroyRef = inject(DestroyRef);
    cartUuid!: string;
    cart!: CartEntityDataResponse;

    public urlSafe!: SafeResourceUrl;
    private readonly sanitizer = inject(DomSanitizer);

    constructor() {}
    ngOnInit(): void {
        this.cartUuid = this.cartSessionService.getCartId() || '';
        if (!this.cartUuid) {
            this.goToStart();
        }
        this.getCartByUuid();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getCartByUuid() {
        this.cartService
            .getByUuid(this.cartUuid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    console.log('Cart data:', response);
                    this.cart = response.data ?? {};

                    if (this.cart.pagoefectivo_result?.cip_url) {
                        console.log('CIP URL:', this.cart.pagoefectivo_result.cip_url);
                        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.cart.pagoefectivo_result?.cip_url ?? '');
                    }
                },
                error: (error) => {
                    if (error.status === 404) {
                        this.cartSessionService.clear();
                        this.goToStart();
                    }
                }
            });
    }

    goToStart() {
        // Navega al inicio del flujo de registro de envíos
        this.router.navigate(['/shipment-record/step/1']);
    }

    onViewStores() {
        console.log('Ver tiendas o agentes');
    }

    onRegisterNewShipment(event: any) {
        console.log('Registrar nuevo envío');
        this.cartService.reset(event);
    }

    onDownloadLabel() {
        console.log('Descargar rótulo');
        const cartSessionId = this.cartSessionService.getCartId();

        if (cartSessionId) {
            this.cartService.downloadLabelPdf(cartSessionId).subscribe({
                next: (response) => {
                    const byteCharacters = atob(response.pdf_base64 ?? '');
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);

                    const blob = new Blob([byteArray], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${response.filename}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                },
                error: (error) => {
                    console.error('Error al descargar el rótulo:', error);
                }
            });
        }
    }

    resetProcess(event: any) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: '<span class="font-montserrat">Perderás toda la información ingresada hasta ahora. <span class=" font-bold">Esta acción es definitiva.</span></span>',
            header: '¿Quieres borrar los datos e iniciar de nuevo?',
            icon: 'pi pi-exclamation-triangle',

            rejectButtonProps: {
                label: 'Siguiente',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Continuar',
                severity: 'primary'
            },

            accept: () => {
                const cartUuid = this.cartSessionService.getCartId() ?? '';
                this.cartService.delete(cartUuid).subscribe({
                    next: (result) => {
                        console.log(result);
                        // this.cartService.delete(cartUuid);
                        this.cartService.setStepNumber(1);
                        // this.cartSessionService.setCurrentStep(1);
                        this.cartSessionService.clear();
                        this.goToStart();
                    },
                    error: (error) => {
                        console.log(error);
                        if (error.status === 404) {
                            this.cartSessionService.clear();
                            this.goToStart();
                        }
                    }
                });
            },
            reject: () => {
                // this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            }
        });
    }
}
