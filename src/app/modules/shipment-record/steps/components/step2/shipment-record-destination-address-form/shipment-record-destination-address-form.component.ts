import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { TrashButtonComponent } from '@shared/components/buttons/trash-button/trash-button.component';
import { ShipmentRecordDestinationMapComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-map/shipment-record-destination-map.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { GeoService } from '@/modules/geo/services/geo.service';
import { AutocompleteCollectionResponse, AutocompletePredictionEntityResponse } from '@/modules/geo/models/autocomplete.model';

import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { SearchAddressEntityResponse, SearchAddressQueryParams } from '@/modules/geo/models/search-address.model';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { DestinationAddressFormState, DestinationAddressFormValues } from '@shipment-record/models/destination-form.model';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { NgTemplateOutlet } from '@angular/common';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-shipment-record-destination-address-form',
    imports: [InputText, TrashButtonComponent, ShipmentRecordDestinationMapComponent, ReactiveFormsModule, AutoComplete, NgTemplateOutlet, Button],
    templateUrl: './shipment-record-destination-address-form.component.html',
    styleUrl: './shipment-record-destination-address-form.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ShipmentRecordDestinationAddressFormComponent implements OnInit, OnDestroy {
    storeDestinationForm!: FormGroup;
    formBuilder = inject(FormBuilder);
    autocompleteCollectionResponse!: AutocompleteCollectionResponse;
    autoCompletePredictions: AutocompletePredictionEntityResponse[] = [];
    currentSearchAddress: SearchAddressEntityResponse | null = null;
    currentPlaceId: string | null = null;
    @Input() homeDestinations: DestinationEntityResponse[] = [];
    homeDestinationsFiltered: DestinationEntityResponse[] = [];
    currentUbigeoDestination: DestinationEntityResponse | null = null;
    showMarker: boolean = true;
    @Output() formChanged = new EventEmitter<DestinationAddressFormState>();
    private readonly geoService = inject(GeoService);
    private readonly destroy$ = new Subject<void>();

    private readonly breakpointService = inject(BreakpointService);
    isMobile = this.breakpointService.isMobile;
    modalVisible: boolean = false;

    ngOnInit(): void {
        this.initForm();
    }
    initForm() {
        this.storeDestinationForm = this.formBuilder.group({
            ubigeo: [null],
            street: [null],
            references: ['']
        });

        this.storeDestinationForm
            .get('street')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    console.log('street value changed to:', response);
                    // if (response) {
                    //     // const length = value.length;
                    //     console.log(response);
                    //     this.autoCompletePredictions = response.data?.predictions || [];
                    // }
                }
            });

        this.storeDestinationForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.currentSearchAddress) {
                this.formChanged.emit(this.buildResponse());
            }
        });
    }

    searchUbigeo(event: AutoCompleteCompleteEvent) {
        console.log('searchUbigeo called');
        let query = event.query.toLowerCase();
        // query = query.replaceAll(' ', '').trim();
        query = query.replaceAll(/[\s,-]/g, '').trim();
        console.log('Ubigeo search query:', query);
        this.homeDestinationsFiltered = this.homeDestinations
            .map((dest) => {
                dest.ubigeo_concatenated_without_spaces = dest.ubigeo_concatenated?.replaceAll(/[\s-]/g, '') || '';
                return dest;
            })
            .filter((dest) => dest.ubigeo_concatenated_without_spaces?.toLowerCase().includes(query))
            .sort((a, b) => {
                const aStarts = a.ubigeo_concatenated_without_spaces?.toLowerCase().startsWith(query);
                const bStarts = b.ubigeo_concatenated_without_spaces?.toLowerCase().startsWith(query);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return 0;
            });
    }

    selectUbigeo(event: AutoCompleteSelectEvent) {
        console.log('Ubigeo selected:', event);

        this.currentUbigeoDestination = event.value;
    }

    search(event: AutoCompleteCompleteEvent) {
        let debounceTimeMs = 3000;
        console.log('searching for', event.query);
        if (!this.currentUbigeoDestination?.district) {
            return;
        }
        const query = `${event.query.toLowerCase()}, ${this.currentUbigeoDestination.district} `;
        this.geoService
            .autocompleteAddress(query)
            .pipe(
                debounceTime(debounceTimeMs),
                // switchMap((street: any) => {
                //     return this.geoService.autocompleteAddress(event.query);
                // }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (response: AutocompleteCollectionResponse) => {
                    if (response) {
                        console.log(response);
                        this.autoCompletePredictions = response.data?.predictions || [];
                    }
                }
            });
    }

    selectAddress(event: AutoCompleteSelectEvent) {
        console.log('Address selected:', event);

        const queryParams: SearchAddressQueryParams = {
            place_id: event.value.place_id
        };
        this.geoService.searchAddress(queryParams).subscribe({
            next: (response) => {
                console.log('Full address details:', response);
                this.currentSearchAddress = response.data ?? {};
                this.currentPlaceId = event.value.place_id ?? null;
                this.showMarker = true;
                this.formChanged.emit(this.buildResponse());
            }
        });
    }
    removeAddress(event: any) {
        console.log('Address removed');

        this.showMarker = false;
        this.currentSearchAddress = null;
        this.currentPlaceId = null;
        this.currentUbigeoDestination = null;
        this.storeDestinationForm.reset({
            ubigeo: '',
            street: '',
            references: ''
        });
        this.formChanged.emit(this.buildResponse());
    }

    buildResponse(): DestinationAddressFormState {
        return {
            searchAddress: this.currentSearchAddress,
            ubigeoDestination: this.currentUbigeoDestination,
            formValues: this.storeDestinationForm.value as DestinationAddressFormValues,
            placeId: this.currentPlaceId
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
