import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ShipmentCardComponent } from '@shipment-record/steps/components/step3/shipment-list/shipment-card.component';
import { CartService } from '@shipment-record/services/cart.service';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';
import { distinctUntilChanged, filter, skip } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-shipment-record-step3',
    imports: [Button, ShipmentCardComponent],
    templateUrl: './shipment-record-step3.component.html',
    styleUrl: './shipment-record-step3.component.scss',
    providers: [DialogService]
})
export class ShipmentRecordStep3Component implements OnInit {
    dialog = inject(DialogService);

    private readonly cartService = inject(CartService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly destroyRef = inject(DestroyRef);

    cartData!: CartSessionStorage;
    ref: DynamicDialogRef | null = null;

    ngOnInit(): void {
        this.loadCartData();
        this.subscribeToCartChanges();
    }

    private subscribeToCartChanges(): void {
        this.cartSessionService.cartChanged$
            .pipe(
                skip(1),
                filter((cart) => cart !== null),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                this.loadCartData();
            });
    }

    loadCartData(): void {
        const data = this.cartSessionService.getCartData();

        this.cartData = {
            ...data,
            items: [...(data?.items ?? [])]
        };
    }

    refreshItems(event: any): void {
        console.log('refreshItems called', event);

        const cartUuid = this.cartSessionService.getCartId() ?? '';

        this.cartService.getByUuid(cartUuid).subscribe({
            next: (response) => {
                this.cartSessionService.setItems(response.data?.items ?? []);
                this.cartSessionService.setPricing(response.data?.pricing ?? {});
                this.loadCartData();
                this.cartService.updateCart();
            }
        });
    }

    editShipment(itemUuid: string): void {
        console.log('Editar envío:', itemUuid);
        this.cartSessionService.setAddingNewItemFromStep3(false);
        this.cartSessionService.setCurrentItemUuid(itemUuid);
        this.cartService.setStepNumber(2);
    }

    openModal(): void {
        this.cartSessionService.setCurrentItemUuid('');
        this.cartSessionService.setAddingNewItemFromStep3(true);
        this.cartService.setStepNumber(2);
    }
}
