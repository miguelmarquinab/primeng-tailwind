import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { ShipmentRecordDestinationAddressFormComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-address-form/shipment-record-destination-address-form.component';
import { ShipmentRecordDestinationStorageFormComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-storage-form/shipment-record-destination-storage-form.component';
import { ShipmentRecordReturnChargeToggleComponent } from '@shipment-record/steps/components/step2/shipment-record-return-charge-toggle/shipment-record-return-charge-toggle.component';
import { DestinationsService } from '@shipment-record/services/destinations.service';
import { DestinationCollectionMode, DestinationCollectionQuery, DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { DestinationAddressFormState, DestinationStoreFormState } from '@shipment-record/models/destination-form.model';
import { Button } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';
import { CartItemDestinationFormState, CartItemDestinationPayload, CartItemEntityResponse, CartItemReturnChargePayload } from '@shipment-record/models/cart-item.model';
import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';
import { forkJoin } from 'rxjs';
import { LocalStorageService } from '@shared/services/storage/local-storage.service';

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
    @Output() returnChargeChanged = new EventEmitter<CartItemReturnChargePayload | undefined| null>();
    private readonly destinationsService: DestinationsService = inject(DestinationsService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly localStorageService = inject(LocalStorageService);
    private homeDestinationReady = false;
    private storeDestinationReady = false;
    ref: DynamicDialogRef<any> | null = null;

    cartData!: CartSessionStorage;
    destinationData!: CartItemDestinationFormState;
    destinationType!: DELIVERY_TYPE;
    @Input() currentItem!: CartItemEntityResponse;

    ngOnInit(): void {
        this.cartData = this.cartSessionService.getCartData();
        console.log(this.currentItem);
        this.loadDestinations();
        if (this.currentItem) {
            if (this.currentItem.service?.delivery_type === DELIVERY_TYPE.HOME) {
                this.currentTab = 0;
            }

            if (this.currentItem.service?.delivery_type === DELIVERY_TYPE.OFFICE) {
                this.currentTab = 1;
            }
        }
        if (this.cartData.header.whoPay === 'DESTINATION') {
            this.changeTab(1);
            return;
        }
        this.changeTab(this.currentTab);

        if (this.currentItem) {
            this.destinationData = {
                ...this.currentItem.destination,
                cargo_flag: '1' // @TODO Change to backend value
            };
        }
    }

    changeTab(tabId: number) {
        this.currentTab = tabId;

        if (tabId === 0) {
            this.destinationType = DELIVERY_TYPE.HOME;
        }
        if (tabId === 1) {
            this.destinationType = DELIVERY_TYPE.OFFICE;
        }
        this.returnChargeChanged.emit();
    }

    ngOnChanges(SimpleChanges: any): void {
        console.log('ngOnChanges Input changes detected:', SimpleChanges);
    }

    loadDestinations() {
        console.log('loadDestinations');

        const ubigeoCode = this.cartData.header.whoPayDetail.ubigeo_code;
        const cacheStoreDestinationsKey = 'storeDestinations_' + ubigeoCode;
        const cacheHomeDestinationsKey = 'homeDestinations_' + ubigeoCode;
        const storeDestinations = this.localStorageService.get(cacheStoreDestinationsKey);
        const homeDestinations = this.localStorageService.get(cacheHomeDestinationsKey);
        if (storeDestinations && homeDestinations) {
            this.storeDestinationsData = storeDestinations;
            this.homeDestinationsData = homeDestinations;

            // this.destinationData.cargo_flag = this.getHomeDestinationById(this.currentItem.destination?.ubigeo_id as string).cargo_flag;
            return;
        }

        const storeQuery: DestinationCollectionQuery = {
            mode: DestinationCollectionMode.STORE,
            ubigeo_code: ubigeoCode,
            modality: this.cartData.header.whoPay ?? '' //DestinationCollectionModality.DESTINATION
        };

        const homeQuery: DestinationCollectionQuery = {
            mode: DestinationCollectionMode.HOME,
            ubigeo_code: ubigeoCode,
            modality: this.cartData.header.whoPay ?? ''
        };
        forkJoin([this.destinationsService.getAll(storeQuery), this.destinationsService.getAll(homeQuery)]).subscribe({
            next: ([storeDestinationsData, homeDestinationsData]) => {
                this.storeDestinationsData = storeDestinationsData.data ?? [];
                this.localStorageService.set(cacheStoreDestinationsKey, this.storeDestinationsData);
                this.homeDestinationsData = homeDestinationsData.data ?? [];
                this.localStorageService.set(cacheHomeDestinationsKey, this.homeDestinationsData);

                // this.destinationData.cargo_flag = this.getHomeDestinationById(this.currentItem.destination?.ubigeo_id as string).cargo_flag;
            }
        });
    }

    getHomeDestinationById(id: string): DestinationEntityResponse {
        return this.homeDestinationsData.find((dest) => dest.ubigeo_id === id) as DestinationEntityResponse;
    }
    selectStoreDestination(destination: DestinationEntityResponse) {
        console.log('Selected destination:', destination);
    }

    onHomeDestinationChanged(payload: CartItemDestinationFormState) {
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

    onStoreDestinationChanged(payload: CartItemDestinationFormState) {
        // const destinationPayload: CartItemDestinationPayload = {
        //     type: 'store',
        //     store: payload
        // };
        // this.cartSessionService.setItemDestination(0, destinationPayload);
        this.destinationData = payload;
        console.log(this.destinationData);
        console.log(this.destinationData?.cargo_flag);
        console.log(typeof this.destinationData?.cargo_flag);
        // this.storeDestinationReady = this.isStoreDestinationReady(payload);
    }

    onReturnChargeChanged(payload?: CartItemReturnChargePayload|null) {
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

        console.log('handleSubmitDestination', this.destinationData);
        console.log('this.destinationType', this.destinationType);
        let destinationPayload: CartItemDestinationPayload = this.buildCartItemDestinationPayload();
        destinationPayload.delivery_type = this.destinationType;
        console.log(destinationPayload);
        this.submitDestination.emit(destinationPayload);
    }

    buildCartItemDestinationPayload(): CartItemDestinationFormState {
        let destinationPayload: CartItemDestinationPayload = { ...this.destinationData };
        if (this.currentItem && !this.destinationData) {
            if (this.destinationType === DELIVERY_TYPE.HOME) {
                return {
                    ubigeo_id: this.currentItem.destination?.ubigeo_id,
                    address: this.currentItem.destination?.address,
                    reference: this.currentItem.destination?.reference ?? '',
                    polygon: this.currentItem.destination?.polygon,
                    latitude: this.currentItem.destination?.latitude,
                    longitude: this.currentItem.destination?.longitude,
                    address_card: this.currentItem.destination?.address_card,
                    delivery_type: this.destinationType
                };
            }

            // if (this.destinationType === DELIVERY_TYPE.OFFICE) {
            //     return {
            //         office_id: this.destinationData?.office_id,
            //         delivery_type: this.destinationType
            //     };
            // }
        }

        // Si hay datos nuevos, devolverlos excluyendo `cargo_flag`
        if (!this.destinationData) {
            return {} as CartItemDestinationFormState;
        }

        const { cargo_flag, ubigeo, ...rest } = this.destinationData as any;
        return { ...rest } as CartItemDestinationFormState;
        // return { ...this.destinationData };
    }

    private isHomeDestinationReady(payload: DestinationAddressFormState): boolean {
        return !!payload.searchAddress?.address && !!payload.ubigeoDestination?.ubigeo_id;
    }

    private isStoreDestinationReady(payload: DestinationStoreFormState): boolean {
        return !!payload.destination?.ubigeo_id;
    }

    protected readonly DELIVERY_TYPE = DELIVERY_TYPE;
}
