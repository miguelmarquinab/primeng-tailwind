import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { DestinationsService } from '@shipment-record/services/destinations.service';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { LocalStorageService } from '@shared/services/storage/local-storage.service';
import {
    ShipmentRecordDestinationAddressFormComponent
} from '@shipment-record/steps/components/step2/shipment-record-destination-address-form/shipment-record-destination-address-form.component';
import {
    ShipmentRecordDestinationStorageFormComponent
} from '@shipment-record/steps/components/step2/shipment-record-destination-storage-form/shipment-record-destination-storage-form.component';
import { DestinationAddressFormState, DestinationStoreFormState } from '@shipment-record/models/destination-form.model';
import { ReturnChargeDetail, ReturnChargeMode } from '@shipment-record/models/return-charge.model';

interface ReturnChargeModalData {
    mode: ReturnChargeMode;
    initialValue?: ReturnChargeDetail | null;
    folios?: number;
}

@Component({
    selector: 'app-shipment-record-return-charge-shipment-record-pin-modal',
    imports: [
        Button,
        Tabs,
        TabList,
        Tab,
        TabPanels,
        TabPanel,
        TranslateModule,
        ShipmentRecordDestinationAddressFormComponent,
        ShipmentRecordDestinationStorageFormComponent
    ],
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
    homeReturn: DestinationAddressFormState | null = null;
    storeReturn: DestinationStoreFormState | null = null;
    private readonly destroy$ = new Subject<void>();
    private readonly dynamicDialogRef = inject(DynamicDialogRef);
    private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
    private readonly destinationsService = inject(DestinationsService);
    private readonly localStorageService = inject(LocalStorageService);

    get canConfirm(): boolean {
        return this.isReturnDestinationReady;
    }

    private get isReturnDestinationReady(): boolean {
        if (this.currentTab === 1) {
            return !!this.storeReturn?.destination?.ubigeo_id;
        }
        return !!this.homeReturn?.searchAddress?.address;
    }

    ngOnInit(): void {
        const data = this.dynamicDialogConfig.data as ReturnChargeModalData | undefined;
        this.mode = data?.mode ?? 'home';
        this.currentFolios = this.normalizeFolios(data?.folios ?? data?.initialValue?.folios);
        this.initSelection(data?.initialValue ?? null);
        this.loadDestinations();
    }

    initSelection(initialValue: ReturnChargeDetail | null) {
        if (initialValue?.destinationType === 'store') {
            this.currentTab = 1;
            return;
        }
        if (initialValue?.destinationType === 'home') {
            this.currentTab = 0;
            return;
        }
        this.currentTab = this.mode === 'store' ? 1 : 0;
    }

    loadDestinations(): void {
        this.loadHomeDestinations();
        this.loadStoreDestinations();
    }

    loadStoreDestinations(): void {
        if (this.localStorageService.get('storeDestinations')) {
            this.storeDestinationsData = this.localStorageService.get('storeDestinations');
            return;
        }
        this.destinationsService
            .getAll('store')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.storeDestinationsData = response.data ?? [];
                    this.localStorageService.set('storeDestinations', this.storeDestinationsData);
                }
            });
    }

    loadHomeDestinations(): void {
        if (this.localStorageService.get('homeDestinations')) {
            this.homeDestinationsData = this.localStorageService.get('homeDestinations');
            return;
        }
        this.destinationsService
            .getAll('home')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.homeDestinationsData = response.data ?? [];
                    this.localStorageService.set('homeDestinations', this.homeDestinationsData);
                }
            });
    }

    changeTab(tabId: number) {
        this.currentTab = tabId;
    }

    onHomeAddressChanged(event: DestinationAddressFormState) {
        this.homeReturn = event;
    }

    onStoreDestinationChanged(event: DestinationStoreFormState) {
        this.storeReturn = event;
    }

    confirmReturnCharge() {
        if (!this.canConfirm) {
            return;
        }
        const detail: ReturnChargeDetail = {
            folios: this.currentFolios,
            destinationType: this.currentTab === 1 ? 'store' : 'home'
        };

        if (detail.destinationType === 'store') {
            detail.store = this.storeReturnForm?.buildResponse() ?? this.storeReturn ?? undefined;
        } else {
            detail.address = this.homeReturnForm?.buildResponse() ?? this.homeReturn ?? undefined;
        }

        this.dynamicDialogRef?.close(detail);
    }

    cancel() {
        this.dynamicDialogRef?.close(null);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private normalizeFolios(value?: number | null): number {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            return 1;
        }
        if (value < 1) {
            return 1;
        }
        if (value > 3) {
            return 3;
        }
        return Math.trunc(value);
    }
}
