import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { ShipmentRecordDestinationAddressFormComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-address-form/shipment-record-destination-address-form.component';
import { ShipmentRecordDestinationStorageFormComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-storage-form/shipment-record-destination-storage-form.component';
import { ShipmentRecordReturnChargeToggleComponent } from '@shipment-record/steps/components/step2/shipment-record-return-charge-toggle/shipment-record-return-charge-toggle.component';
import { DestinationsService } from '@shipment-record/services/destinations.service';
import { DestinationCollectionModality, DestinationCollectionMode, DestinationCollectionQuery, DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { DestinationAddressFormState, DestinationStoreFormState } from '@shipment-record/models/destination-form.model';
// import { CartItemAddressPayload, CartItemDestinationPayload } from '@shipment-record/models/cart.model';
import { Button } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';
import { CartItemDestinationPayload, CartItemReturnChargePayload } from '@shipment-record/models/cart-item.model';
import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';
import { forkJoin } from 'rxjs';

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
    @Output() submitDestination = new EventEmitter<any>();
    @Output() returnChargeChanged = new EventEmitter<CartItemReturnChargePayload>();
    private readonly destinationsService: DestinationsService = inject(DestinationsService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private homeDestinationReady = false;
    private storeDestinationReady = false;
    ref: DynamicDialogRef<any> | null = null;

    cartData!: CartSessionStorage;
    destinationData: any;
    destinationType!: DELIVERY_TYPE;

    ngOnInit(): void {
        this.cartData = this.cartSessionService.getCartData();
        this.loadDestinations();
        if (this.cartData.header.whoPay === 'DESTINATION') {
            this.changeTab(1);
            return;
        }
        this.changeTab(this.currentTab);
    }

    changeTab(tabId: number) {
        this.currentTab = tabId;

        if (tabId === 0) {
            // this.homeDestinationsData = [];

            this.destinationType = DELIVERY_TYPE.HOME;
            // if (this.localStorageService.get('homeDestinations')) {
            //     this.homeDestinationsData = this.localStorageService.get('homeDestinations');
            // } else {
            //     this.loadHomeDestinations();
            // }
        }
        if (tabId === 1) {
            // this.storeDestinationsData = [];

            this.destinationType = DELIVERY_TYPE.OFFICE;
            // if (this.localStorageService.get('storeDestinations')) {
            //     this.storeDestinationsData = this.localStorageService.get('storeDestinations');
            // } else {
            //     this.loadStoreDestinations();
            // }
        }
    }

    loadDestinations() {
        const storeQuery: DestinationCollectionQuery = {
            mode: DestinationCollectionMode.STORE,
            ubigeo_code: this.cartData.header.whoPayDetail.ubigeo_code,
            modality: DestinationCollectionModality.DESTINATION
        };

        const homeQuery: DestinationCollectionQuery = {
            mode: DestinationCollectionMode.HOME,
            ubigeo_code: this.cartData.header.whoPayDetail.ubigeo_code,
            modality: DestinationCollectionModality.DESTINATION
        };
        forkJoin([this.destinationsService.getAll(storeQuery), this.destinationsService.getAll(homeQuery)]).subscribe({
            next: ([storeDestinationsData, homeDestinationsData]) => {
                this.storeDestinationsData = storeDestinationsData.data ?? [];
                // this.localStorageService.set('storeDestinations', this.storeDestinationsData);
                this.homeDestinationsData = homeDestinationsData.data ?? [];
                // this.localStorageService.set('homeDestinations', this.homeDestinationsData);
            }
        });
    }

    // loadStoreDestinations(): void {
    //     const query: DestinationCollectionQuery = {
    //         mode: DestinationCollectionMode.STORE,
    //         ubigeo_code: this.cartData.header.whoPayDetail.ubigeo_code,
    //         modality: DestinationCollectionModality.DESTINATION
    //     };
    //     this.destinationsService.getAll(query).subscribe({
    //         next: (response) => {
    //             console.log('Destinations loaded:', response);
    //             this.storeDestinationsData = response.data ?? [];
    //             this.localStorageService.set('storeDestinations', this.storeDestinationsData);
    //         }
    //     });
    // }
    // loadHomeDestinations(): void {
    //     const query: DestinationCollectionQuery = {
    //         mode: DestinationCollectionMode.HOME,
    //         ubigeo_code: this.cartData.header.whoPayDetail.ubigeo_code,
    //         modality: DestinationCollectionModality.DESTINATION
    //     };
    //     this.destinationsService.getAll(query).subscribe({
    //         next: (response) => {
    //             console.log('Destinations loaded:', response);
    //             this.homeDestinationsData = response.data ?? [];
    //             this.localStorageService.set('homeDestinations', this.homeDestinationsData);
    //         }
    //     });
    // }

    selectStoreDestination(destination: DestinationEntityResponse) {
        console.log('Selected destination:', destination);
    }

    onHomeDestinationChanged(payload: DestinationAddressFormState) {
        console.log('Home destination changed:', payload);

        this.destinationData = payload;
        // const destinationPayload: CartItemAddressPayload = {
        //     type: 'home',
        //     // address: payload
        // };
        // // this.cartSessionService.setItemDestination(0, destinationPayload);
        // this.homeDestinationReady = this.isHomeDestinationReady(payload);
        // this.submitDestination.emit(payload);
    }

    onStoreDestinationChanged(payload: DestinationStoreFormState) {
        // const destinationPayload: CartItemDestinationPayload = {
        //     type: 'store',
        //     store: payload
        // };
        // this.cartSessionService.setItemDestination(0, destinationPayload);
        this.destinationData = payload;
        this.storeDestinationReady = this.isStoreDestinationReady(payload);
    }

    onReturnChargeChanged(payload: CartItemReturnChargePayload) {
        console.log('Return charge changed:', payload);
        this.returnChargeChanged.emit(payload);
    }

    get isNextDisabled(): boolean {
        return this.currentTab === 0 ? !this.homeDestinationReady : !this.storeDestinationReady;
    }

    handleSubmitDestination(): void {
        // if (this.isNextDisabled) {
        //     return;
        // }
        // const sessionUuid = this.cartSessionService.getCardId();
        // if (!sessionUuid) {
        //     return;
        // }

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
        console.log('handleSubmitDestination', this.destinationData);
        let destinationPayload: CartItemDestinationPayload = {};
        if (this.destinationType === DELIVERY_TYPE.HOME) {
            destinationPayload = {
                ubigeo_id: this.destinationData.formValues?.ubigeo?.ubigeo_id,
                address: this.destinationData.searchAddress?.address,
                reference: this.destinationData.formValues?.references,
                polygon: this.destinationData.searchAddress?.polygon,
                // office_id: 0,
                delivery_type: this.destinationType
            };
        }
        if (this.destinationType === DELIVERY_TYPE.OFFICE) {
            console.log(this.destinationData);
            destinationPayload = {
                office_id: this.destinationData.destination.office_id,
                delivery_type: this.destinationType
            };
        }

        console.log(destinationPayload);
        this.submitDestination.emit(destinationPayload);
        //     }
        // });
    }

    // buildDestinationPayload(): CartItemDestinationPayload {
    //
    // }

    private isHomeDestinationReady(payload: DestinationAddressFormState): boolean {
        return !!payload.searchAddress?.address && !!payload.ubigeoDestination?.ubigeo_id;
    }

    private isStoreDestinationReady(payload: DestinationStoreFormState): boolean {
        return !!payload.destination?.ubigeo_id;
    }

    protected readonly DELIVERY_TYPE = DELIVERY_TYPE;
}
