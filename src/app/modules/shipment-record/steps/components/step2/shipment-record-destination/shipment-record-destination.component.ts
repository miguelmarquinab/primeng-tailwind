import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { ShipmentRecordDestinationAddressFormComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-address-form/shipment-record-destination-address-form.component';
import { ShipmentRecordDestinationStorageFormComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-storage-form/shipment-record-destination-storage-form.component';
import { ShipmentRecordReturnChargeToggleComponent } from '@shipment-record/steps/components/step2/shipment-record-return-charge-toggle/shipment-record-return-charge-toggle.component';
import { DestinationsService } from '@shipment-record/services/destinations.service';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { LocalStorageService } from '@shared/services/storage/local-storage.service';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { DestinationAddressFormState, DestinationStoreFormState } from '@shipment-record/models/destination-form.model';
import { CartItemDestinationPayload } from '@shipment-record/models/cart.model';
import { Button } from 'primeng/button';
import { ReturnChargePayload } from '@shipment-record/models/return-charge.model';
import { CartService } from '@shipment-record/services/cart.service';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';

@Component({
    selector: 'app-shipment-record-destination',
    imports: [Tab, TabList, TabPanel, TabPanels, Tabs, ShipmentRecordDestinationAddressFormComponent, ShipmentRecordDestinationStorageFormComponent, ShipmentRecordReturnChargeToggleComponent, Button, ReactiveFormsModule],
    templateUrl: './shipment-record-destination.component.html',
    styleUrl: './shipment-record-destination.component.scss',
    providers: [DialogService]
})
export class ShipmentRecordDestinationComponent implements OnInit {
    currentTab = 0;
    storeDestinationsData: DestinationEntityResponse[] = [];
    homeDestinationsData: DestinationEntityResponse[] = [];
    @Output() submitDestination = new EventEmitter<void>();
    @Output() returnChargeChanged = new EventEmitter<ReturnChargePayload>();
    private readonly destinationsService: DestinationsService = inject(DestinationsService);
    private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly cartService = inject(CartService);
    private readonly dialogService = inject(DialogService);
    private homeDestinationReady = false;
    private storeDestinationReady = false;
    ref: DynamicDialogRef<any> | null = null;

    cartData!: CartSessionStorage;

    ngOnInit(): void {
        this.changeTab(this.currentTab);
        this.cartData = this.cartSessionService.getCartData();

        if (this.cartData.header.whoPay === 'DESTINATION') {
            this.changeTab(1)
        }
    }

    changeTab(tabId: number) {
        this.currentTab = tabId;

        if (tabId === 0) {
            this.homeDestinationsData = [];
            if (this.localStorageService.get('homeDestinations')) {
                this.homeDestinationsData = this.localStorageService.get('homeDestinations');
            } else {
                this.loadHomeDestinations();
            }
        }
        if (tabId === 1) {
            this.storeDestinationsData = [];
            if (this.localStorageService.get('storeDestinations')) {
                this.storeDestinationsData = this.localStorageService.get('storeDestinations');
            } else {
                this.loadStoreDestinations();
            }
        }
    }

    loadStoreDestinations(): void {
        this.destinationsService.getAll('store').subscribe({
            next: (response) => {
                console.log('Destinations loaded:', response);
                this.storeDestinationsData = response.data ?? [];
                this.localStorageService.set('storeDestinations', this.storeDestinationsData);
            }
        });
    }
    loadHomeDestinations(): void {
        this.destinationsService.getAll('home').subscribe({
            next: (response) => {
                console.log('Destinations loaded:', response);
                this.homeDestinationsData = response.data ?? [];
                this.localStorageService.set('homeDestinations', this.homeDestinationsData);
            }
        });
    }

    selectStoreDestination(destination: DestinationEntityResponse) {
        console.log('Selected destination:', destination);
    }

    onHomeDestinationChanged(payload: DestinationAddressFormState) {
        console.log('Home destination changed:', payload);

        const destinationPayload: CartItemDestinationPayload = {
            type: 'home',
            address: payload
        };
        this.cartSessionService.setItemDestination(0, destinationPayload);
        this.homeDestinationReady = this.isHomeDestinationReady(payload);
    }

    onStoreDestinationChanged(payload: DestinationStoreFormState) {
        const destinationPayload: CartItemDestinationPayload = {
            type: 'store',
            store: payload
        };
        this.cartSessionService.setItemDestination(0, destinationPayload);
        this.storeDestinationReady = this.isStoreDestinationReady(payload);
    }

    onReturnChargeChanged(payload: ReturnChargePayload) {
        this.returnChargeChanged.emit(payload);
    }

    get isNextDisabled(): boolean {
        return this.currentTab === 0 ? !this.homeDestinationReady : !this.storeDestinationReady;
    }

    handleSubmitDestination(): void {
        if (this.isNextDisabled) {
            return;
        }
        const sessionUuid = this.cartSessionService.getCardId();
        if (!sessionUuid) {
            return;
        }
        // this.ref = this.dialogService.open(ShipmentRecordConfirmationModalComponent, {
        //     height: 'auto',
        //     width: '340px',
        //     shipment-record-pin-modal: true,
        //     closable: true,
        //     breakpoints: {
        //         '960px': '75vw',
        //         '640px': '90vw'
        //     }
        // });
        // const payload = this.cartSessionService.buildCartPayload();
        // this.cartService.update(sessionUuid, payload).subscribe({
        //     next: () => {
        this.submitDestination.emit();
        //     }
        // });
    }

    private isHomeDestinationReady(payload: DestinationAddressFormState): boolean {
        return !!payload.searchAddress?.address && !!payload.ubigeoDestination?.ubigeo_id;
    }

    private isStoreDestinationReady(payload: DestinationStoreFormState): boolean {
        return !!payload.destination?.ubigeo_id;
    }
}
