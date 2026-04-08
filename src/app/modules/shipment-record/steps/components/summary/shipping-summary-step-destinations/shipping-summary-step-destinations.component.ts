import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { take } from 'rxjs';
import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';
import { CartService } from '@shipment-record/services/cart.service';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { ShippingSummaryStepHeaderComponent } from '@shipment-record/steps/components/summary/shipping-summary-step-header/shipping-summary-step-header.component';
import { ShippingSummaryStepTimelineMarkerComponent } from '@shipment-record/steps/components/summary/shipping-summary-step-timeline-marker/shipping-summary-step-timeline-marker.component';
import { CartItemCloneButtonComponent } from '@shipment-record/steps/components/summary/shipping-summary-buttons/cart-item-clone-button/cart-item-clone-button.component';
import { CartItemDeleteButtonComponent } from '@shipment-record/steps/components/summary/shipping-summary-buttons/delete/cart-item-delete-button.component';

@Component({
    selector: 'app-shipping-summary-step-destinations',
    standalone: true,
    imports: [DecimalPipe, ShippingSummaryStepHeaderComponent, ShippingSummaryStepTimelineMarkerComponent, CartItemCloneButtonComponent, CartItemDeleteButtonComponent, TitleCasePipe],
    templateUrl: './shipping-summary-step-destinations.component.html',
    styleUrl: './shipping-summary-step-destinations.component.scss'
})
export class ShippingSummaryStepDestinationsComponent implements OnChanges {
    @Input() items: CartItemEntityResponse[] = [];
    @Output() itemsChanged = new EventEmitter<void>();

    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly cartService = inject(CartService);

    protected readonly DELIVERY_TYPE = DELIVERY_TYPE;

    expandedItemUuid: string | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['items']) {
            this.syncExpandedItem();
        }
    }

    get cartUuid(): string {
        return this.cartSessionService.getCartId() ?? '';
    }

    hasItems(): boolean {
        return this.items.length > 0;
    }

    isExpanded(item: CartItemEntityResponse): boolean {
        return item?.uuid === this.expandedItemUuid;
    }

    expandItem(item: CartItemEntityResponse): void {
        const itemUuid = item?.uuid ?? null;
        if (!itemUuid) {
            return;
        }

        this.expandedItemUuid = itemUuid;
    }

    private syncExpandedItem(): void {
        if (!this.items.length) {
            this.expandedItemUuid = null;
            return;
        }

        const exists = this.items.some((item) => item.uuid === this.expandedItemUuid);

        if (!exists) {
            this.expandedItemUuid = this.items[0]?.uuid ?? null;
        }
    }

    editItem(cartItemUuid: string): void {
        console.log('Editar item desde resumen step 2:', cartItemUuid);
        this.cartSessionService.setAddingNewItemFromStep3(false);
        this.cartService.setStepNumber(2);
    }

    refreshItems(): void {
        const cartUuid = this.cartUuid;

        if (!cartUuid) {
            return;
        }

        this.cartService
            .getByUuid(cartUuid)
            .pipe(take(1))
            .subscribe({
                next: (response) => {
                    const refreshedItems = response?.data?.items ?? [];

                    this.cartSessionService.setItems(refreshedItems);
                    this.items = [...refreshedItems];

                    this.syncExpandedItem();

                    this.cartService.updateCart();
                    this.itemsChanged.emit();
                },
                error: (error) => {
                    console.error('Error refreshing summary items:', error);
                }
            });
    }

    getReceiverFullName(item: CartItemEntityResponse): string {
        const firstNames = item?.who_receive?.first_names ?? '';
        const lastName = item?.who_receive?.last_name ?? '';
        return `${firstNames} ${lastName}`.trim();
    }

    getDeliveryLabel(item: CartItemEntityResponse): string {
        if (item?.service?.delivery_type === DELIVERY_TYPE.HOME) {
            return 'Entrega a domicilio';
        }

        if (item?.service?.delivery_type === DELIVERY_TYPE.OFFICE) {
            return 'Entrega a tienda';
        }

        return '';
    }

    getLocationLabel(item: CartItemEntityResponse): string {
        if (item?.service?.delivery_type === DELIVERY_TYPE.OFFICE) {
            return item?.destination?.office?.office_name ?? 'Lima';
        }

        if (item?.service?.delivery_type === DELIVERY_TYPE.HOME) {
            return item?.destination?.ubigeo?.district ?? item?.destination?.ubigeo?.district ?? item?.destination?.ubigeo?.name ?? 'Lima';
        }

        return 'Lima';
    }

    getDescriptionLabel(item: CartItemEntityResponse): string {
        return item?.what_send?.article_category?.description ?? 'Sin descripción';
    }

    getAddressLabel(item: CartItemEntityResponse): string {
        if (item?.service?.delivery_type === DELIVERY_TYPE.HOME) {
            return item?.destination?.address ?? '';
        }

        if (item?.service?.delivery_type === DELIVERY_TYPE.OFFICE) {
            return item?.destination?.office?.office_address ?? '';
        }

        return '';
    }

    getWeightAndMeasures(item: CartItemEntityResponse): string {
        const height = item?.what_send?.height ?? 0;
        const width = item?.what_send?.width ?? 0;
        const length = item?.what_send?.length ?? 0;
        const weight = item?.what_send?.weight ?? 0;
        return `(${length}x${width}x${height}cm / ${weight} kg)`;
    }
}
