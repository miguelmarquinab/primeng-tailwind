import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { ShipmentRecordDestinationAddressFormComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-address-form/shipment-record-destination-address-form.component';
import { ShipmentRecordDestinationStorageFormComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-storage-form/shipment-record-destination-storage-form.component';
import { ShipmentRecordReturnChargeToggleComponent } from '@shipment-record/steps/components/step2/shipment-record-return-charge-toggle/shipment-record-return-charge-toggle.component';
import { DestinationsService } from '@shipment-record/services/destinations.service';
import { DestinationCollectionMode, DestinationCollectionQuery, DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
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
    returnChargeHomeDestinationsData: DestinationEntityResponse[] = [];
    returnChargeStoreDestinationsData: DestinationEntityResponse[] = [];
    @Output() submitDestination = new EventEmitter<any>();
    @Output() returnChargeChanged = new EventEmitter<CartItemReturnChargePayload | undefined | null>();
    private readonly destinationsService: DestinationsService = inject(DestinationsService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly localStorageService = inject(LocalStorageService);
    ref: DynamicDialogRef<any> | null = null;

    cartData!: CartSessionStorage;
    destinationData: CartItemDestinationFormState | null = null;
    destinationType!: DELIVERY_TYPE;
    @Input() currentItem!: CartItemEntityResponse;
    returnChargePayload: CartItemReturnChargePayload | null | undefined = null;

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
        this.destinationData = null;

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

        const ubigeoCode = this.cartData.header?.whoPayDetail?.ubigeo_code;
        const headquarterId = this.cartData.header?.whoPayDetail?.headquarter_id ?? '';
        const cacheStoreDestinationsKey = 'storeDestinations_' + ubigeoCode;
        const cacheHomeDestinationsKey = 'homeDestinations_' + ubigeoCode;
        const cacheStoreReturnDestinationsKey = 'storeReturnDestinations_' + headquarterId;
        const cacheHomeReturnDestinationsKey = 'homeReturnDestinations_' + headquarterId;
        const storeDestinations = this.localStorageService.get(cacheStoreDestinationsKey);
        const homeDestinations = this.localStorageService.get(cacheHomeDestinationsKey);
        const returnChargeStoreDestinations = this.localStorageService.get(cacheStoreReturnDestinationsKey);
        const returnChargeHomeDestinations = this.localStorageService.get(cacheHomeReturnDestinationsKey);
        if (storeDestinations && homeDestinations && returnChargeStoreDestinations && returnChargeHomeDestinations) {
            this.storeDestinationsData = storeDestinations;
            this.homeDestinationsData = homeDestinations;
            this.returnChargeHomeDestinationsData = returnChargeHomeDestinations;
            this.returnChargeStoreDestinationsData = returnChargeStoreDestinations;
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

        const returnChargeHomeQuery: DestinationCollectionQuery = {
            mode: DestinationCollectionMode.HOME,
            id_headquarter: parseInt(headquarterId),
            modality: this.cartData.header.whoPay ?? ''
        };

        const returnChargeStoreQuery: DestinationCollectionQuery = {
            mode: DestinationCollectionMode.STORE,
            id_headquarter: parseInt(headquarterId),
            modality: this.cartData.header.whoPay ?? ''
        };

        forkJoin([
            this.destinationsService.getAll(storeQuery),
            this.destinationsService.getAll(homeQuery),
            this.destinationsService.getReturnChargeDestinations(returnChargeStoreQuery),
            this.destinationsService.getReturnChargeDestinations(returnChargeHomeQuery)
        ]).subscribe({
            next: ([storeDestinationsData, homeDestinationsData, returnChargeStoreDestinationsData, returnChargeHomeDestinationsData]) => {
                this.storeDestinationsData = storeDestinationsData.data ?? [];
                this.homeDestinationsData = homeDestinationsData.data ?? [];
                this.returnChargeStoreDestinationsData = returnChargeStoreDestinationsData.data ?? [];
                this.returnChargeHomeDestinationsData = returnChargeHomeDestinationsData.data ?? [];
                this.localStorageService.set(cacheStoreDestinationsKey, this.storeDestinationsData);
                this.localStorageService.set(cacheHomeDestinationsKey, this.homeDestinationsData);
                this.localStorageService.set(cacheStoreReturnDestinationsKey, this.returnChargeStoreDestinationsData);
                this.localStorageService.set(cacheHomeReturnDestinationsKey, this.returnChargeHomeDestinationsData);

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
        // this.cartSessionService.setItemDestination(0, destinationPayload);v

        this.destinationData = payload;
        console.log(this.destinationData);
        console.log(this.destinationData?.cargo_flag);
        console.log(typeof this.destinationData?.cargo_flag);
        // this.storeDestinationReady = this.isStoreDestinationReady(payload);
    }

    onReturnChargeChanged(payload?: CartItemReturnChargePayload | null) {
        console.log('Return charge changed:', payload);
        this.returnChargePayload = payload;
        this.returnChargeChanged.emit(payload);
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
                    reference: this.currentItem.destination?.reference?.trim() ?? '',
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

    get isReadyNext(): boolean {
        let valid = false;

        let returnChargeValid = this.returnChargePayload?.returnChargeControl;

        if (returnChargeValid) {
            return !!this.returnChargePayload?.office_id || !!this.returnChargePayload?.ubigeo_id;
        }

        // console.log(this.destinationData);
        const reference = this.destinationData?.reference ?? '';
        if (this.currentTab === 0) {
            return !!this.destinationData?.ubigeo_id && this.destinationData?.reference?.trim() === reference && reference.length > 0;
        }
        if (this.currentTab === 1) {
            return !!this.destinationData?.office_id;
        }
        return valid;
    }

    protected readonly DELIVERY_TYPE = DELIVERY_TYPE;
}
