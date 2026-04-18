import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputText } from 'primeng/inputtext';
import { TrashButtonComponent } from '@shared/components/buttons/trash-button/trash-button.component';
import { ShipmentRecordDestinationMapComponent } from '@shipment-record/steps/components/step2/shipment-record-destination-map/shipment-record-destination-map.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { CartItemDestinationEntityResponse, CartItemDestinationFormState, CartItemEntityResponse } from '@shipment-record/models/cart-item.model';
import { AppConstant } from '@shared/contants/app.constant';
import { InputRegexDirective } from '@shared/directives/input-regex.directive';
import { BlockPasteDirective } from '@shared/directives/block-paste.directive';
import { TrimValidator } from '@shared/validators/trim.validator';

@Component({
    selector: 'app-shipment-record-destination-address-form',
    imports: [InputText, TrashButtonComponent, ShipmentRecordDestinationMapComponent, ReactiveFormsModule, AutoComplete, NgTemplateOutlet, Button, OlvaErrorMessageComponent, InputRegexDirective, BlockPasteDirective],
    templateUrl: './shipment-record-destination-address-form.component.html',
    styleUrl: './shipment-record-destination-address-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShipmentRecordDestinationAddressFormComponent implements OnInit {
    storeDestinationForm!: FormGroup;

    // Inputs
    homeDestinations = input<DestinationEntityResponse[]>([]);
    currentItem = input.required<CartItemEntityResponse>();
    changeReturnForm = input(false);

    // Output
    formChanged = output<CartItemDestinationFormState>();

    // Estado interno como signals
    readonly autoCompletePredictions = signal<AutocompletePredictionEntityResponse[]>([]);
    readonly currentSearchAddress = signal<SearchAddressEntityResponse | null>(null);
    readonly homeDestinationsFiltered = signal<DestinationEntityResponse[]>([]);
    readonly showMarker = signal(true);
    readonly currentAutocompletePrediction = signal<AutocompletePredictionEntityResponse | null>(null);
    readonly modalVisible = signal(false);
    readonly autocompleteSearchStatus = signal('');

    private readonly formBuilder = inject(FormBuilder);
    private readonly geoService = inject(GeoService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly breakpointService = inject(BreakpointService);
    isMobile = this.breakpointService.isMobile;

    ngOnInit(): void {
        this.buildFormGroup();
        this.subscribeToFormChanges();
        this.patchExistingData();
    }

    private buildFormGroup(): void {
        this.storeDestinationForm = this.formBuilder.group({
            ubigeo: [null, [Validators.required, TrimValidator()]],
            street: [null, [Validators.required, TrimValidator()]],
            references: [null, [Validators.required, TrimValidator()]],
            dangerous: [false]
        });
    }

    private subscribeToFormChanges(): void {
        this.storeDestinationForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.formChanged.emit(this.buildResponse());
        });
    }

    private patchExistingData(): void {
        const item = this.currentItem();
        if (!item) {
            return;
        }

        const source: CartItemDestinationEntityResponse | undefined = this.changeReturnForm() ? item.return_charge : item.destination;

        if (!source) {
            return;
        }

        const ubigeo = this.findUbigeoById(source.ubigeo_id || '');
        this.storeDestinationForm.patchValue({
            ubigeo,
            references: source.reference || ''
        });
    }

    findUbigeoById(ubigeoId: string): DestinationEntityResponse | undefined {
        return this.homeDestinations().find((dest) => dest.ubigeo_id === ubigeoId);
    }

    searchUbigeo(event: AutoCompleteCompleteEvent) {
        const query = event.query
            .toLowerCase()
            .replaceAll(/[\s,-]/g, '')
            .trim();

        this.homeDestinationsFiltered.set(
            this.homeDestinations()
                .map((dest) => ({
                    ...dest,
                    ubigeo_concatenated_without_spaces: dest.ubigeo_concatenated?.replaceAll(/[\s-]/g, '') || ''
                }))
                .filter((dest) => dest.ubigeo_concatenated_without_spaces.toLowerCase().includes(query))
                .sort((a, b) => {
                    const aHasOrder = a.sort_order != null;
                    const bHasOrder = b.sort_order != null;
                    if (aHasOrder && bHasOrder && a.sort_order !== b.sort_order) {
                        return a.sort_order! - b.sort_order!;
                    }
                    const aStarts = a.ubigeo_concatenated_without_spaces.toLowerCase().startsWith(query);
                    const bStarts = b.ubigeo_concatenated_without_spaces.toLowerCase().startsWith(query);
                    if (aStarts !== bStarts) return aStarts ? -1 : 1;
                    return 0;
                })
        );
    }

    selectUbigeo(event: AutoCompleteSelectEvent) {
        this.resetSearchAddress();
        this.resetCurrentSearchAddress();
        this.currentSearchAddress.set({
            coordinates: {
                latitude: parseFloat(event.value.department_latitude ?? '0'),
                longitude: parseFloat(event.value.department_longitude ?? '0')
            }
        });

        this.resetReferences();
        this.resetCurrentAutocompletePrediction();
    }

    resetSearchAddress() {
        this.storeDestinationForm.get('street')?.patchValue(null, {
            emitEvent: false
        });
    }
    // resetReferences() {
    //     this.storeDestinationForm.get('references')?.enable();
    // }

    resetReferences() {
        this.storeDestinationForm.get('references')?.enable( {
            emitEvent: false
        });
        this.storeDestinationForm.get('references')?.patchValue(null, {
            emitEvent: false
        });
    }

    resetCurrentSearchAddress() {
        this.currentSearchAddress.set(null);
    }

    resetCurrentAutocompletePrediction() {
        this.currentAutocompletePrediction.set(null);
    }

    ubigeoInputKeydown(_event: KeyboardEvent) {
        if (this.storeDestinationForm.get('street')?.value) {
            this.resetSearchAddress();
            this.resetReferences();
            this.resetCurrentSearchAddress();
            this.resetCurrentAutocompletePrediction();
        }
    }

    destinationAddressInputKeydown(_event: KeyboardEvent) {
        this.resetReferences();
        this.resetCurrentSearchAddress();
        this.resetCurrentAutocompletePrediction();
    }

    search(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLowerCase();
        this.geoService
            .autocompleteAddress(query)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: AutocompleteCollectionResponse) => {
                    if (response) {
                        this.autoCompletePredictions.set(response.data?.predictions || []);
                        this.autocompleteSearchStatus.set(response.data?.status ?? '');
                    }
                },
                error: () => {
                    this.autoCompletePredictions.set([]);
                    this.autocompleteSearchStatus.set('');
                }
            });
    }

    selectAddress(event: AutoCompleteSelectEvent) {
        console.log(event);
        this.currentAutocompletePrediction.set(event.value);
        const queryParams: SearchAddressQueryParams = {
            place_id: event.value.place_id
        };
        this.geoService
            .searchAddress(queryParams)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    const searchAddress = response.data ?? {};
                    this.currentSearchAddress.set(searchAddress);
                    const currentHomeDestination = this.getHomeDestinationByUbigeo(searchAddress.ubigeo ?? '');

                    console.log(response);
                    if (currentHomeDestination.length > 0) {
                        this.storeDestinationForm.get('ubigeo')?.setValue(currentHomeDestination[0]);
                    }
                    this.storeDestinationForm.get('street')?.setValue(event.value?.description ?? '', {
                        emitEvent: false
                    });
                    this.showMarker.set(true);

                    if (searchAddress.dangerous) {
                        this.storeDestinationForm.get('references')?.disable();
                    }
                    this.storeDestinationForm.get('dangerous')?.patchValue(searchAddress.dangerous ?? false);
                    this.formChanged.emit(this.buildResponse());
                },
                error: () => {
                    this.currentAutocompletePrediction.set(null);
                }
            });
    }

    getHomeDestinationByUbigeo(ubigeo: string): DestinationEntityResponse[] {
        return this.homeDestinations().filter((dest) => dest.ubigeo_code === ubigeo);
    }

    removeAddress(event: Event) {
        event.stopPropagation();
        this.currentSearchAddress.set(null);
        this.currentAutocompletePrediction.set(null);
        this.showMarker.set(false);
        this.storeDestinationForm.reset({
            ubigeo: '',
            street: '',
            references: ''
        });
        this.formChanged.emit(this.buildResponse());
    }

    buildResponse(): CartItemDestinationFormState {
        const ubigeoValue = this.storeDestinationForm.get('ubigeo')?.value;
        const searchAddress = this.currentSearchAddress();
        return {
            ubigeo_id: ubigeoValue?.ubigeo_id ?? '',
            address: searchAddress?.address,
            reference: this.storeDestinationForm.get('references')?.value,
            longitude: searchAddress?.coordinates?.longitude,
            latitude: searchAddress?.coordinates?.latitude,
            address_card: searchAddress?.address,
            delivery_type: DELIVERY_TYPE.HOME,
            cargo_flag: ubigeoValue?.cargo_flag ?? '0',
            polygon: searchAddress?.polygon,
            dangerous: this.storeDestinationForm.get('dangerous')?.value ?? false
        };
    }

    showModal() {
        if (this.isMobile()) {
            this.modalVisible.set(true);
        }
    }

    mapClick(event: LeafletMouseEvent) {
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;
        this.geoService
            .reverse(lat, lng)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    if (response?.data) {
                        this.showMarker.set(true);
                        const currentHomeDestination = this.getHomeDestinationByUbigeo(response.data.ubigeo ?? '');

                        if (currentHomeDestination.length > 0) {
                            this.currentSearchAddress.set({
                                dangerous: response.data.dangerous
                            });
                            this.storeDestinationForm.get('ubigeo')?.setValue(currentHomeDestination[0]);
                        }
                        this.storeDestinationForm.patchValue({
                            street: response.data.address || ''
                        });
                    }
                }
            });
    }

    protected readonly ShipmentRecordStepsConstant = ShipmentRecordStepsConstant;
    protected readonly AppConstant = AppConstant;
}
