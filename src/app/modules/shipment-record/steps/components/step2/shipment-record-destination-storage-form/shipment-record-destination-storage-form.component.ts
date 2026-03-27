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
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { Button } from 'primeng/button';
import { CartSessionStorage } from '@shipment-record/models/cart-session-storage.model';
import { CartItemDestinationFormState, CartItemEntityResponse } from '@shipment-record/models/cart-item.model';
import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';

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
    @Input() currentItem!: CartItemEntityResponse;
    currentDestination: DestinationEntityResponse = { ubigeo_concatenated: '' };
    headquarters: HeadquartersEntityResponse[] = [];
    formBuilder = inject(FormBuilder);
    storeDestinationForm!: FormGroup;
    currentTab = 0;
    storeDestinationFiltered: DestinationEntityResponse[] = [];
    @Output() formChanged = new EventEmitter<CartItemDestinationFormState>();
    private readonly sessionStorage = inject(SessionStorageService);
    private readonly destroy$ = new Subject<void>();

    private readonly breakpointService = inject(BreakpointService);
    isMobile = this.breakpointService.isMobile;
    modalVisible: boolean = false;
    @Input() changeReturnForm = false;

    tabsEnabled: boolean[] = [true, true, true];

    ngOnInit(): void {
        if (this.currentItem) {
        }
        this.initForm();
        this.initStoreDestinations();
        this.buildTabsEnabled()

        console.log('--> this.currentItem.destination', this.currentItem?.destination);
    }


    ngOnChanges(SimpleChanges: any): void {
        console.log('Input changes detected:', SimpleChanges);
    }

    buildTabsEnabled(){

        if(this.cartData?.header?.whoPay === 'DESTINATION'){
            this.tabsEnabled = [true,false,false];
        }
    }

    initStoreDestinations() {
        if (this.cartData?.header?.whoPay === 'DESTINATION') {
            this.storeDestinationsData = this.filterStoreHeadquarters();
        }

        if (this.currentItem) {
            console.log(this.currentItem.destination);
            if (this.changeReturnForm) {
                const currentDestination = this.findDestinationByOfficeId(this.currentItem.return_charge?.office_id as number) as DestinationEntityResponse;
                console.log(currentDestination);
                this.storeDestinationFiltered = [currentDestination];
                this.selectDestination(currentDestination);
            }
            if (!this.changeReturnForm) {
                if (this.currentItem.service?.delivery_type === DELIVERY_TYPE.OFFICE) {
                    const currentDestination = this.findDestinationByOfficeId(this.currentItem.destination?.office_id as number) as DestinationEntityResponse;
                    console.log(currentDestination);
                    this.storeDestinationFiltered = [currentDestination];
                    this.selectDestination(currentDestination);
                }
            }
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

    findDestinationByOfficeId(officeId: number): DestinationEntityResponse {
        return this.storeDestinationsData.find((destination) => destination.office_id === officeId) as DestinationEntityResponse;
    }

    selectDestination(destination: DestinationEntityResponse) {
        console.log(destination);
        this.currentDestination = destination;
        this.formChanged.emit(this.buildResponse());
    }

    buildResponse(): CartItemDestinationFormState {
        return {
            office_id: this.currentDestination.office_id,
            delivery_type: DELIVERY_TYPE.OFFICE,
            cargo_flag: this.currentDestination.cargo_flag
            // destination: this.currentDestination,
            // formValues: this.storeDestinationForm.value as DestinationStoreFormValues
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
