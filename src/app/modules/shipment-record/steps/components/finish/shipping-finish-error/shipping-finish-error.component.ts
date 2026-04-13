import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { CartService } from '@shipment-record/services/cart.service';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { ConfirmationService } from 'primeng/api';
import { Subject } from 'rxjs';
import { LoadingService } from '@shared/services/is-loading/loading.service';
import { Router } from '@angular/router';
import { CartEntityDataResponse } from '@shipment-record/models/cart.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingComponent } from '@shared/components/loading/loading.component';

@Component({
    selector: 'app-shipping-finish-error',
    imports: [LoadingComponent],
    templateUrl: './shipping-finish-error.component.html',
    styleUrl: './shipping-finish-error.component.scss',
    providers: [ConfirmationService]
})
export class ShippingFinishErrorComponent implements OnInit, OnDestroy {
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
    ngOnInit(): void {
        this.cartUuid = this.cartSessionService.getCartId() || '';
        if (!this.cartUuid) {
            this.goToStart();
        }
        this.getCartByUuid();
    }

    getCartByUuid() {
        this.cartService
            .getByUuid(this.cartUuid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    console.log('Cart data:', response);
                    this.cart = response.data ?? {};
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
