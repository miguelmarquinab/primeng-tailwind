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

@Component({
    selector: 'app-shipment-record-layout',
    imports: [ShipmentRecordStepsComponent, ShipmentRecordStep1Component, ShipmentRecordStep2Component, ShipmentRecordStep3Component, ShippingSummaryComponent, Button, Drawer, LoadingComponent],
    templateUrl: './shipment-record-layout.component.html',
    styleUrl: './shipment-record-layout.component.scss',
    encapsulation: ViewEncapsulation.None
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
        this.cartService.cartStore$.pipe(takeUntil(this.destroy$)).subscribe((cart) => {
            if (cart?.stepNumber) {
                this.setCurrentStep(cart.stepNumber);
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
