import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { ShipmentRecordDestinationAddressFormComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-address-form/shipment-record-destination-address-form.component';
import { ShipmentRecordDestinationStorageFormComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-storage-form/shipment-record-destination-storage-form.component';
import { ReturnChargeDetail, ReturnChargeMode } from '@shipment-record/models/return-charge.model';
import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';
import { CartItemDestinationFormState, CartItemEntityResponse } from '@shipment-record/models/cart-item.model';

interface ReturnChargeModalData {
    mode: ReturnChargeMode;
    initialValue?: ReturnChargeDetail | null;
    folio?: number;
    storeDestinationsData?: DestinationEntityResponse[];
    homeDestinationsData?: DestinationEntityResponse[];
    currentItem?: CartItemEntityResponse;
}

@Component({
    selector: 'app-shipment-record-return-charge-shipment-record-pin-modal',
    imports: [Button, Tabs, TabList, Tab, TabPanels, TabPanel, TranslateModule, ShipmentRecordDestinationAddressFormComponent, ShipmentRecordDestinationStorageFormComponent],
    templateUrl: './shipment-record-return-charge-modal.component.html',
    standalone: true,
    styleUrl: './shipment-record-return-charge-modal.component.scss'
})
export class ShipmentRecordReturnChargeModalComponent implements OnInit, OnDestroy {
    @ViewChild('homeReturnForm') homeReturnForm?: ShipmentRecordDestinationAddressFormComponent;
    @ViewChild('storeReturnForm') storeReturnForm?: ShipmentRecordDestinationStorageFormComponent;

    mode: ReturnChargeMode = 'home';
    currentTab = 0;
    private currentFolios = 1;
    homeDestinationsData: DestinationEntityResponse[] = [];
    storeDestinationsData: DestinationEntityResponse[] = [];
    private readonly destroy$ = new Subject<void>();
    private readonly dynamicDialogRef = inject(DynamicDialogRef);
    private readonly dynamicDialogConfig = inject(DynamicDialogConfig);

    destinationData!: CartItemDestinationFormState | undefined;
    // currentDestinationReturnCharge?: CartItemDestinationReturnChargeEntityResponse;
    currentItem!: CartItemEntityResponse;

    get canConfirm(): boolean {
        return this.isReturnDestinationReady;
    }

    get isReturnDestinationReady(): boolean {
        if (this.destinationData?.dangerous) {
            return false;
        }
        if (this.currentTab === 0) {
            if (!this.destinationData?.reference) {
                return false;
            }
        }
        if (this.currentTab === 1) {
            return !!this.destinationData?.office_id || !!this.destinationData?.reference;
        }

        return !!this.destinationData?.ubigeo_id || !!this.destinationData?.reference;
    }

    ngOnInit(): void {
        const data = this.dynamicDialogConfig.data as ReturnChargeModalData | undefined;
        this.mode = data?.mode ?? 'home';
        // this.currentFolios = data?.folio ??0; //this.normalizeFolios(data?.folios ?? data?.initialValue?.folio);
        this.initSelection(data?.initialValue ?? null);
        if (data?.currentItem) {
            this.currentItem = data?.currentItem;
            this.destinationData = {
                ...this.currentItem.return_charge
            };
            this.currentTab = this.getActiveTab();
        }
        this.loadDestinations();
    }

    initSelection(initialValue: ReturnChargeDetail | null) {
        this.currentTab = this.mode === 'store' ? 1 : 0;
    }

    getActiveTab() {
        if (this.currentItem?.return_charge?.office_id) {
            return 1;
        }
        // if (this.currentItem?.return_charge?.ubigeo_id) {
        return 0;
        // }
    }

    loadDestinations(): void {
        this.homeDestinationsData = this.dynamicDialogConfig.data.homeDestinationsData ?? [];
        this.storeDestinationsData = this.dynamicDialogConfig.data.storeDestinationsData ?? [];
    }

    changeTab(tabId: number) {
        this.currentTab = tabId;
        delete this.destinationData;
    }

    onHomeAddressChanged(event: CartItemDestinationFormState) {
        console.log(event);
        this.destinationData = event;
    }

    onStoreDestinationChanged(event: CartItemDestinationFormState) {
        this.destinationData = event;
    }

    confirmReturnCharge() {
        if (!this.canConfirm) {
            return;
        }
        const detail: ReturnChargeDetail = {
            // folio: this.currentFolios,
            delivery_type: this.currentTab === 1 ? DELIVERY_TYPE.OFFICE : DELIVERY_TYPE.HOME,
            destination: this.destinationData
        };

        // if (detail.delivery_type === DELIVERY_TYPE.OFFICE) {
        //     detail.store = this.storeReturnForm?.buildResponse() ?? this.storeReturn ?? undefined;
        // } else {
        //     detail.address = this.homeReturnForm?.buildResponse() ?? this.homeReturn ?? undefined;
        // }
        //
        // console.log('confirmReturnCharge: ', detail);
        //
        // let returnChargePayload = {};
        //
        // if (detail.delivery_type === DELIVERY_TYPE.HOME) {
        //     returnChargePayload = {
        //         ubigeo_id: detail?.address?.formValues?.ubigeo?.ubigeo_id,
        //         address: detail?.address?.searchAddress?.address,
        //         reference: detail?.address?.formValues?.references,
        //         polygon: detail?.address?.searchAddress?.polygon,
        //         office_id: 0,
        //         delivery_type: detail.delivery_type
        //     };
        // }
        // if (detail.delivery_type === DELIVERY_TYPE.OFFICE) {
        //     returnChargePayload = {
        //         office_id: detail?.store?.destination.headquarter_id,
        //         delivery_type: detail.delivery_type
        //     };
        // }

        this.dynamicDialogRef?.close(detail);
    }

    cancel() {
        this.dynamicDialogRef?.close(null);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // private normalizeFolios(value?: number | null): number {
    //     if (typeof value !== 'number' || Number.isNaN(value)) {
    //         return 1;
    //     }
    //     if (value < 1) {
    //         return 1;
    //     }
    //     if (value > 3) {
    //         return 3;
    //     }
    //     return Math.trunc(value);
    // }
}
