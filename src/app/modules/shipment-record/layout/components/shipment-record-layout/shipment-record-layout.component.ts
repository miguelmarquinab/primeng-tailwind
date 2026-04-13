import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ShipmentRecordStepsComponent } from '@shipment-record/steps/components/shipment-record-steps/shipment-record-steps.component';
import { ActivatedRoute } from '@angular/router';
import { ShipmentRecordStep1Component } from '@shipment-record/steps/components/step1/shipment-record-step1/shipment-record-step1.component';
import { ShipmentRecordStep2Component } from '@shipment-record/steps/components/step2/shipment-record-step2/shipment-record-step2.component';
import { ShipmentRecordStep3Component } from '@shipment-record/steps/components/step3/shipment-record-step3/shipment-record-step3.component';
import { ShippingSummaryComponent } from '@shipment-record/steps/components/summary/shipping-summary/shipping-summary.component';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { AuthService } from '@/modules/authentication/token/services/auth.service';
import { environment } from '@env/environment';
import { TokenPayload } from '@/modules/authentication/token/models/token.model';
import { SessionStorageService } from '@shared/services/storage/session-storage.service';
import { LoadingService } from '@shared/services/is-loading/loading.service';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { CartService } from '@shipment-record/services/cart.service';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { HeadquartersService } from '@shipment-record/services/headquarters.service';
import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CartEntityDataResponse, CartEntityResponse } from '@shipment-record/models/cart.model';

@Component({
    selector: 'app-shipment-record-layout',
    host: {
        class: 'flex min-h-0 flex-1 flex-col w-full'
    },
    imports: [ShipmentRecordStepsComponent, ShipmentRecordStep1Component, ShipmentRecordStep2Component, ShipmentRecordStep3Component, ShippingSummaryComponent, Button, Drawer, LoadingComponent, ConfirmDialogModule, NgClass],
    templateUrl: './shipment-record-layout.component.html',
    styleUrl: './shipment-record-layout.component.scss',
    encapsulation: ViewEncapsulation.None,
    providers: [ConfirmationService]
})
export class ShipmentRecordLayoutComponent implements OnInit, OnDestroy {
    stepNumber = 1;
    tokenIsLoading = false;
    openSummaryDrawer = false;
    headquarters: HeadquartersEntityResponse[] = [];
    private readonly destroy$ = new Subject<void>();
    private readonly route = inject(ActivatedRoute);
    private readonly cartSessionStorageService = inject(CartSessionStorageService);
    private readonly tokenService = inject(AuthService);
    private readonly sessionStorage = inject(SessionStorageService);
    private readonly loadingService: LoadingService = inject(LoadingService);
    loading = this.loadingService.loading;
    private readonly breakpointService = inject(BreakpointService);
    isMobile = this.breakpointService.isMobile;
    private readonly cartService: CartService = inject(CartService);
    private readonly headquartersService = inject(HeadquartersService);
    private confirmationService = inject(ConfirmationService);

    stepLabel = 'Datos de origen';
    cart!: CartEntityDataResponse;

    constructor() {
        const raw = this.route.snapshot.paramMap.get('stepNumber');
        this.stepNumber = Number(raw);
    }

    ngOnInit(): void {
        this.getToken();
        this.subscribeToCart();
    }

    setCurrentStep(stepNumber: number) {
        this.stepNumber = stepNumber;
        this.cartSessionStorageService.setCurrentStep(stepNumber);
        if (this.stepNumber === 1) {
            this.stepLabel = 'Datos de origen';
        }
        if (this.stepNumber === 2) {
            this.stepLabel = 'Datos de envío';
        }
        if (this.stepNumber === 3) {
            this.stepLabel = 'Confirmación y pago';
        }
    }

    getToken() {
        this.tokenIsLoading = true;
        const clientConfig: TokenPayload = this.buildClientToken();

        if (this.tokenService.isTokenValid()) {
            this.tokenIsLoading = false;
            return;
        }
        this.tokenService
            .createToken(clientConfig)
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => {
                this.sessionStorage.setPlain('token', response.access_token);
                if (response.refresh_token) {
                    this.sessionStorage.setPlain('refresh_token', response.refresh_token);
                }
                this.getAllHeadquarters();
                if (this.stepNumber > 1) {
                }
                this.tokenIsLoading = false;
            });
    }

    buildClientToken(): TokenPayload {
        const config = environment.shippingRecords.public.config;
        return {
            grant_type: config.grant_type,
            client_id: config.client_id,
            client_secret: config.client_secret
        };
    }

    showSummary() {
        this.openSummaryDrawer = true;
    }

    subscribeToCart() {
        console.log('subscribeToCartMethod');
        this.cartService.cartStore$.pipe(takeUntil(this.destroy$)).subscribe((cart) => {
            console.log('subscribeToCart', cart);
            if (cart?.stepNumber) {
                this.setCurrentStep(cart.stepNumber);
                return;
            }
            if (cart?.reset) {
                this.resetProcess(cart?.event);
                return;
            }
        });
    }

    getAllHeadquarters() {
        this.headquartersService.getAll().subscribe({
            next: (headquarters) => {
                this.headquarters = headquarters.data ?? [];

                this.sessionStorage.set('headquarters', this.headquarters);
            },
            error: (error) => {
                console.log(error);
            }
        });
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
                const cartUuid = this.cartSessionStorageService.getCartId() ?? '';
                this.cartService.delete(cartUuid).subscribe({
                    next: (result) => {
                        console.log(result);
                        this.setCurrentStep(1);
                        this.cartSessionStorageService.clear();
                    },
                    error: (error) => {
                        console.log(error);
                        if (error.status === 404) {
                            this.setCurrentStep(1);
                            this.cartSessionStorageService.clear();
                        }
                    }
                });
            },
            reject: () => {
                // this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            }
        });
    }

    reset(event: any) {
        this.cartService.reset(event);
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get currentCartData(): CartEntityDataResponse | null {
        return this.cartSessionStorageService.getCartData() ?? null;
    }

    get mobileTotalAmount(): string {
        const pricingTotal = this.currentCartData?.pricing?.total;
        const total = typeof pricingTotal === 'number' ? pricingTotal : 0;
        return `S/${total.toFixed(2)}`;
    }

    goToPayment(): void {
        this.showSummary();
    }

    addAdditionalShipment(): void {
        this.cartSessionStorageService.setCurrentItemUuid('');
        this.cartSessionStorageService.setAddingNewItemFromStep3(true);
        this.cartService.setStepNumber(2);
    }
}
