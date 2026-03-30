import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { ShipmentRecordDestinationCardComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-card/shipment-record-destination-card.component';
import { SessionStorageService } from '@shared/services/storage/session-storage.service';
import { HeadquartersEntityResponse } from '@shipment-record/models/headquarters.model';
import { InputText } from 'primeng/inputtext';
import { Subject, takeUntil } from 'rxjs';
import { ShipmentRecordDestinationStorageMapComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-storage-map/shipment-record-destination-storage-map.component';
import { DestinationStoreFormState, DestinationStoreFormValues } from '@shipment-record/models/destination-form.model';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { Button } from 'primeng/button';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';

@Component({
    selector: 'app-shipment-record-destination-storage-form',
    imports: [ReactiveFormsModule, NgClass, Tab, TabList, Tabs, TabPanel, TabPanels, ShipmentRecordDestinationCardComponent, NgTemplateOutlet, InputText, ShipmentRecordDestinationStorageMapComponent, Button],
    templateUrl: './shipment-record-destination-storage-form.component.html',
    styleUrl: './shipment-record-destination-storage-form.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ShipmentRecordDestinationStorageFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input() storeDestinationsData: DestinationEntityResponse[] = [];
    @Input() cartData!: CartSessionStorage;
    storeDestinationsFiltered: DestinationEntityResponse[] = [];
    currentDestination: DestinationEntityResponse = { ubigeo_concatenated: '' };
    headquarters: HeadquartersEntityResponse[] = [];
    headquartersFiltered: HeadquartersEntityResponse[] = [];
    formBuilder = inject(FormBuilder);
    storeDestinationForm!: FormGroup;
    currentTab = 0;
    storeDestinationFiltered: DestinationEntityResponse[] = [];
    @Output() formChanged = new EventEmitter<DestinationStoreFormState>();
    private readonly sessionStorage = inject(SessionStorageService);
    private readonly destroy$ = new Subject<void>();

    private readonly breakpointService = inject(BreakpointService);
    isMobile = this.breakpointService.isMobile;
    modalVisible: boolean = false;

    ngOnInit(): void {
        this.initForm();
        this.initStoreDestinations();
    }

    ngOnChanges(SimpleChanges: any): void {
        console.log('Input changes detected:', SimpleChanges);
    }

    initStoreDestinations() {
        if (this.cartData?.header?.whoPay === 'DESTINATION') {
            this.storeDestinationsData = this.filterStoreHeadquarters();
        }
    }

    initForm() {
        this.storeDestinationForm = this.formBuilder.group({
            destination: [null],
            additionalInfo: ['']
        });

        this.storeDestinationForm
            .get('destination')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (value) => {
                    if (value) {
                        this.storeDestinationFiltered = this.storeDestinationsData.filter((item) => {
                            return item.ubigeo_concatenated.toLowerCase().includes(value.toLowerCase());
                        });
                    }
                }
            });

        this.storeDestinationForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.currentDestination?.ubigeo_id) {
                this.formChanged.emit(this.buildResponse());
            }
        });
    }

    changeTab(tabId: number) {
        console.log('Changing to tab:', tabId);
        this.currentTab = tabId;
        this.storeDestinationFiltered = [];
        if (tabId === 0) {
            this.storeDestinationFiltered = [...this.storeDestinationsData];
        }

        if (tabId === 1) {
            this.storeDestinationFiltered = this.filterStoreHeadquarters();
        }

        if (tabId === 2) {
            this.storeDestinationFiltered = this.filterAgentsHeadquarters();
        }
    }

    filterStoreHeadquarters() {
        return this.storeDestinationsData.filter((item) => item.is_agent === false);
    }

    filterAgentsHeadquarters() {
        return this.storeDestinationsData.filter((item) => item.is_agent === true);
    }

    selectDestination(destination: DestinationEntityResponse) {
        console.log(destination);
        this.currentDestination = destination;
        this.formChanged.emit(this.buildResponse());
    }

    buildResponse(): DestinationStoreFormState {
        return {
            destination: this.currentDestination,
            formValues: this.storeDestinationForm.value as DestinationStoreFormValues
        };
    }

    showModal() {
        console.log('Show Modal', this.isMobile());
        if (this.isMobile()) {
            console.log('Show Modal');
            this.modalVisible = true;
        }
    }


    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
