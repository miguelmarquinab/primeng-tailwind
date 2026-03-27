import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { TrashButtonComponent } from '@shared/components/buttons/trash-button/trash-button.component';
import { ShipmentRecordDestinationMapComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-map/shipment-record-destination-map.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject, takeUntil, tap } from 'rxjs';
import { GeoService } from '@/modules/geo/services/geo.service';
import { AutocompleteCollectionResponse, AutocompletePredictionEntityResponse } from '@/modules/geo/models/autocomplete.model';

import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { SearchAddressEntityResponse, SearchAddressQueryParams } from '@/modules/geo/models/search-address.model';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { NgTemplateOutlet } from '@angular/common';
import { Button } from 'primeng/button';
import { LeafletMouseEvent } from 'leaflet';
import { DELIVERY_TYPE, ShipmentRecordStepsConstant } from '@shipment-record/contansts/shipment-record-step.constant';
import { OlvaErrorMessageComponent } from '@shared/components/message/olva-error-message/olva-error-message.component';
import { CartItemDestinationFormState, CartItemEntityResponse } from '@shipment-record/models/cart-item.model';

@Component({
    selector: 'app-shipment-record-destination-address-form',
    imports: [InputText, TrashButtonComponent, ShipmentRecordDestinationMapComponent, ReactiveFormsModule, AutoComplete, NgTemplateOutlet, Button, OlvaErrorMessageComponent],
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
    @Input() currentItem!: CartItemEntityResponse;
    @Input() changeReturnForm = false;
    homeDestinationsFiltered: DestinationEntityResponse[] = [];
    currentUbigeoDestination: DestinationEntityResponse | null = null;
    showMarker = true;

    currentAutocompletePrediction!: AutocompletePredictionEntityResponse | null;
    @Output() formChanged = new EventEmitter<CartItemDestinationFormState>();
    private readonly geoService = inject(GeoService);
    private readonly destroy$ = new Subject<void>();

    private readonly breakpointService = inject(BreakpointService);
    isMobile = this.breakpointService.isMobile;
    modalVisible = false;
    autocompleteSearchStatus = '';

    cartItemDestinationForm!: CartItemDestinationFormState;

    ngOnInit(): void {
        this.initForm();
        console.log('----> initForm', this.currentItem);
    }
    initForm() {
        this.storeDestinationForm = this.formBuilder.group({
            ubigeo: [null],
            street: [null],
            references: ['']
        });

        // this.storeDestinationForm
        //     .get('ubigeo')
        //     ?.valueChanges.pipe(
        //         tap({
        //             next: (ubigeoText: string) => {
        //                 console.log(ubigeoText);
        //             }
        //         }),
        //         takeUntil(this.destroy$)
        //     )
        //     .subscribe({
        //         next: (response) => {
        //             console.log('ubigeo value changed to:', response);
        //             // if (response) {
        //             //     // const length = value.length;
        //             //     console.log(response);
        //             //     this.autoCompletePredictions = response.data?.predictions || [];
        //             // }
        //         }
        //     });

        // this.storeDestinationForm
        //     .get('street')
        //     ?.valueChanges.pipe(takeUntil(this.destroy$))
        //     .subscribe({
        //         next: (response) => {
        //             console.log('street value changed to:', response);
        //             // if (response) {
        //             //     // const length = value.length;
        //             //     console.log(response);
        //             //     this.autoCompletePredictions = response.data?.predictions || [];
        //             // }
        //         }
        //     });

        this.storeDestinationForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.currentSearchAddress) {
                this.formChanged.emit(this.buildResponse());
            }
        });

        if (this.currentItem) {
            if (this.changeReturnForm) {
                const ubigeo = this.findUbigeoById(this.currentItem.return_charge?.ubigeo_id || '');
                const references = this.currentItem.return_charge?.reference || '';
                this.storeDestinationForm.get('references')?.patchValue(this.currentItem.return_charge?.reference || '');
                this.storeDestinationForm.patchValue({
                    ubigeo,
                    references
                });
                return;
            }
            const ubigeo = this.findUbigeoById(this.currentItem.destination?.ubigeo_id || '');
            const references = this.currentItem.destination?.reference || '';
            this.storeDestinationForm.get('references')?.patchValue(this.currentItem.destination?.reference || '');
            this.storeDestinationForm.patchValue({
                ubigeo,
                references
            });
        }
    }

    findUbigeoById(ubigeoId: string): DestinationEntityResponse {
        return this.homeDestinations.find((dest) => dest.ubigeo_id === ubigeoId) as DestinationEntityResponse;
    }
    searchUbigeo(event: AutoCompleteCompleteEvent) {
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
            })
            .sort((a, b) => {
                const aHas = a.sort_order != null;
                const bHas = b.sort_order != null;
                if (aHas && bHas) return a.sort_order! - b.sort_order!;
                if (aHas && !bHas) return -1;
                if (!aHas && bHas) return 1;
                return 0;
            });
    }

    selectUbigeo(event: AutoCompleteSelectEvent) {
        console.log('Ubigeo selected:', event);

        this.currentUbigeoDestination = event.value;

        this.currentSearchAddress = {
            coordinates: {
                latitude: parseFloat(event.value.department_latitude ?? '0'),
                longitude: parseFloat(event.value.department_longitude ?? '0')
            }
        };

        this.resetSearchAddress();
        this.resetReferences();
        this.resetCurrentAutocompletePrediction();
        this.resetCurrentSearchAddress();
    }

    resetSearchAddress() {
        this.storeDestinationForm.get('street')?.patchValue(null, {
            emitEvent: false
        });
    }

    resetReferences() {
        this.storeDestinationForm.get('references')?.patchValue(null, {
            emitEvent: false
        });
    }
    resetCurrentSearchAddress() {
        this.currentSearchAddress = null;
    }
    resetCurrentAutocompletePrediction() {
        this.currentAutocompletePrediction = null;
    }

    ubigeoInputKeydown(event: KeyboardEvent) {
        console.log('UbigeoInputKeydown', event);

        if (this.storeDestinationForm.get('street')?.value) {
            this.resetSearchAddress();
            this.resetReferences();
            this.resetCurrentSearchAddress();
            this.resetCurrentAutocompletePrediction();
        }
    }
    search(event: AutoCompleteCompleteEvent) {
        const debounceTimeMs = 3000;
        console.log('searching for', event.query);
        // if (!this.currentUbigeoDestination?.district) {
        //     return;
        // }
        // const query = `${event.query.toLowerCase()}, ${this.currentUbigeoDestination.district} `;
        const query = `${event.query.toLowerCase()}`;
        this.geoService
            .autocompleteAddress(query)
            .pipe(debounceTime(debounceTimeMs), takeUntil(this.destroy$))
            .subscribe({
                next: (response: AutocompleteCollectionResponse) => {
                    if (response) {
                        console.log(response);
                        this.autoCompletePredictions = response.data?.predictions || [];
                        this.autocompleteSearchStatus = response.data?.status ?? '';
                    }
                }
            });
    }

    selectAddress(event: AutoCompleteSelectEvent) {
        console.log('Address selected:', event);
        this.currentAutocompletePrediction = event.value;
        const queryParams: SearchAddressQueryParams = {
            place_id: event.value.place_id
        };
        this.geoService.searchAddress(queryParams).subscribe({
            next: (response) => {
                console.log('Full address details:', response);
                this.currentSearchAddress = response.data ?? {};
                const currentHomeDestination = this.getHomeDestinationByUbigeo(this.currentSearchAddress.ubigeo ?? '');
                console.log('currentHomeDestination', currentHomeDestination);

                if (currentHomeDestination.length > 0) {
                    this.storeDestinationForm.get('ubigeo')?.setValue(currentHomeDestination[0]);
                }
                this.currentPlaceId = event.value.place_id ?? null;
                this.showMarker = true;
                this.formChanged.emit(this.buildResponse());

                console.log(this.storeDestinationForm.value);
            }
        });
    }

    getHomeDestinationByUbigeo(ubigeo: string) {
        return this.homeDestinations.filter((dest) => dest.ubigeo_code === ubigeo);
    }
    removeAddress(event: any) {
        console.log('Address removed');

        this.resetCurrentSearchAddress();
        this.resetCurrentAutocompletePrediction();
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

    buildResponse(): CartItemDestinationFormState {
        // ubigeo_id: this.destinationData.formValues?.ubigeo?.ubigeo_id, **
        // address: this.destinationData.searchAddress?.address,
        // reference: this.destinationData.formValues?.references,
        // polygon: this.destinationData.searchAddress?.polygon,
        // latitude: this.destinationData.searchAddress?.coordinates?.latitude,
        // longitude: this.destinationData.searchAddress?.coordinates?.longitude,
        // address_card: this.destinationData.searchAddress?.address,
        // delivery_type: this.destinationType

        return {
            // searchAddress: this.currentSearchAddress,
            // ubigeoDestination: this.currentUbigeoDestination,
            // formValues: this.storeDestinationForm.value as DestinationAddressFormValues,
            // placeId: this.currentPlaceId,
            ubigeo_id: this.storeDestinationForm.get('ubigeo')?.value?.ubigeo_id ?? '',
            address: this.currentSearchAddress?.address,
            reference: this.storeDestinationForm.get('references')?.value,
            longitude: this.currentSearchAddress?.coordinates?.longitude,
            latitude: this.currentSearchAddress?.coordinates?.latitude,
            address_card: this.currentSearchAddress?.address,
            delivery_type: DELIVERY_TYPE.HOME,
            cargo_flag: this.storeDestinationForm.get('ubigeo')?.value?.cargo_flag ?? '0',
            polygon: this.currentSearchAddress?.polygon
        };
    }

    showModal() {
        console.log('Show Modal', this.isMobile());
        if (this.isMobile()) {
            console.log('Show Modal');
            this.modalVisible = true;
        }
    }

    mapClick(event: LeafletMouseEvent) {
        console.log('Map clicked:', event);

        const lat = event.latlng.lat;
        const lng = event.latlng.lng;
        this.geoService.reverse(lat, lng).subscribe({
            next: (response) => {
                console.log('Reverse geocoding response:', response);
                if (response && response.data) {
                    this.showMarker = true;
                    const currentHomeDestination = this.getHomeDestinationByUbigeo(response.data.ubigeo ?? '');
                    console.log('currentHomeDestination', currentHomeDestination);

                    if (currentHomeDestination.length > 0) {
                        this.currentSearchAddress = {
                            dangerous: response.data.dangerous
                        };
                        this.storeDestinationForm.get('ubigeo')?.setValue(currentHomeDestination[0]);
                    }
                    this.storeDestinationForm.patchValue({
                        street: response.data.address || ''
                    });
                    // this.formChanged.emit(this.buildResponse());
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    protected readonly ShipmentRecordStepsConstant = ShipmentRecordStepsConstant;
}
