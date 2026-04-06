import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import {
    ShipmentRecordReturnChargeModalComponent
} from '@shipment-record/steps/components/step2/shipment-record-return-charge-modal/shipment-record-return-charge-modal.component';
import { ReturnChargeDetail } from '@shipment-record/models/return-charge.model';
import { InputNumber } from 'primeng/inputnumber';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';
import {
    CartItemDestinationFormState,
    CartItemEntityResponse,
    CartItemReturnChargePayload
} from '@shipment-record/models/cart-item.model';
import { DELIVERY_TYPE } from '@shipment-record/contansts/shipment-record-step.constant';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-shipment-record-return-charge-toggle',
    imports: [ReactiveFormsModule, ToggleSwitch, TranslateModule, InputNumber, TitleCasePipe],
    templateUrl: './shipment-record-return-charge-toggle.component.html',
    styleUrl: './shipment-record-return-charge-toggle.component.scss',
    providers: [DialogService]
})
export class ShipmentRecordReturnChargeToggleComponent implements OnInit, OnDestroy {
    @Input() mode: DELIVERY_TYPE = DELIVERY_TYPE.HOME;
    @Input() itemIndex = 0;

    @Input() storeDestinationsData: DestinationEntityResponse[] = [];
    @Input() homeDestinationsData: DestinationEntityResponse[] = [];
    @Input() checked: boolean = false;
    @Input() currentItem!: CartItemEntityResponse;
    @Output() returnChargeChanged = new EventEmitter<CartItemReturnChargePayload | null>();

    returnChargeControl = new FormControl(false, { nonNullable: true });
    foliosControl = new FormControl(1, {
        nonNullable: true,
        validators: [Validators.min(1), Validators.max(3)]
    });
    returnChargeDetail: ReturnChargeDetail | null = null;
    private dialogRef: DynamicDialogRef | null = null;
    private readonly dialogService = inject(DialogService);
    // private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly breakpointService = inject(BreakpointService);
    isMobile = this.breakpointService.isMobile;
    private readonly destroy$ = new Subject<void>();
    returnChargePayload!: CartItemReturnChargePayload;

    returnChargeForm!: FormGroup;
    formBuilder = inject(FormBuilder);
    showDetail: boolean = false;

    ngOnInit(): void {
        // this.seedFromStorage();
        // this.returnChargeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((enabled) => {
        //     // if (enabled) {
        //     //     this.syncReturnChargePayload();
        //     //     return;
        //     // }
        //     this.clearReturnCharge();
        // });
        this.returnChargeFormInit();

        // this.foliosControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
        //     console.log(value);
        //     if (!this.returnChargeControl.value) {
        //         return;
        //     }
        //     if (this.returnChargeDetail) {
        //         this.returnChargeDetail = {
        //             ...this.returnChargeDetail,
        //             delivery_type: this.mode,
        //             folio: value
        //         };
        //     }
        //     // this.syncReturnChargePayload();
        // });

        if (this.currentItem) {
            if (this.currentItem.service?.return_charge) {
                this.returnChargeForm?.patchValue({
                    returnChargeControl: true,
                    folio: this.currentItem.return_charge?.folio ?? 1,
                    destination: {
                        office_id: this.currentItem.return_charge?.office_id,
                        address: this.currentItem.return_charge?.address,
                        reference: this.currentItem.return_charge?.reference,
                        address_card: this.currentItem.return_charge?.address_card,
                        latitude: this.currentItem.return_charge?.latitude,
                        longitude: this.currentItem.return_charge?.longitude,
                        polygon: this.currentItem.return_charge?.polygon,
                        ubigeo_id: this.currentItem.return_charge?.ubigeo_id
                    }
                });
            }

            // console.log(this.currentItem.service?.return_charge);
            // console.log(this.currentItem.return_charge);
            // this.returnChargeControl.patchValue(this.currentItem.service?.return_charge ?? false);
            // this.foliosControl.patchValue(this.currentItem.return_charge?.folio ?? 0);
            //
            // this.returnChargePayload = {
            //     folio: this.currentItem.return_charge?.folio ?? 0,
            //     // delivery_type: this.currentItem.return_charge?.delivery_type ?? this.mode,
            //     office_id: this.currentItem.return_charge?.office_id,
            //     ubigeo_id: this.currentItem.return_charge?.ubigeo_id,
            //     address: this.currentItem.return_charge?.address,
            //     reference: this.currentItem.return_charge?.reference,
            //     address_card: this.currentItem.return_charge?.address_card,
            //     latitude: this.currentItem.return_charge?.latitude,
            //     longitude: this.currentItem.return_charge?.longitude,
            //     polygon: this.currentItem.return_charge?.polygon
            // };
            // this.returnChargeChanged.emit({
            //     folio: this.returnChargePayload.folio ?? 0,
            //     office_id: this.currentItem?.return_charge?.office_id,
            //     address: this.currentItem?.return_charge?.address,
            //     reference: this.currentItem?.return_charge?.reference,
            //     address_card: this.currentItem?.return_charge?.address_card,
            //     latitude: this.currentItem?.return_charge?.latitude,
            //     longitude: this.currentItem?.return_charge?.longitude,
            //     polygon: this.currentItem?.return_charge?.polygon,
            //     ubigeo_id: this.currentItem?.return_charge?.ubigeo_id
            // });
            //// this.applyReturnCharge(this.returnChargePayload);
        }
    }

    returnChargeFormInit() {
        this.returnChargeForm = this.formBuilder.group({
            returnChargeControl: [false, [Validators.required]],
            folio: [1, [Validators.min(1), Validators.max(3)]],
            destination: [null]
        });

        this.returnChargeForm
            .get('returnChargeControl')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (value) => {
                    this.showDetail = value;
                    if (!this.showDetail) {
                        this.returnChargeForm.reset(
                            {
                                returnChargeControl: false,
                                folio: 1,
                                destination: null
                            },
                            {
                                emitEvent: false
                            }
                        );
                    }
                }
            });

        this.returnChargeForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
            next: (value) => {
                console.log(value);

                let destination: CartItemDestinationFormState = value.destination;

                if (!value.returnChargeControl) {
                    this.returnChargeChanged.emit(null);
                    return;
                }

                this.returnChargePayload = {
                    folio: value.folio ?? 0,
                    office_id: destination?.office_id,
                    address: destination?.address,
                    reference: destination?.reference,
                    address_card: destination?.address_card,
                    latitude: destination?.latitude,
                    longitude: destination?.longitude,
                    polygon: destination?.polygon,
                    ubigeo_id: destination?.ubigeo_id,
                    returnChargeControl: value.returnChargeControl
                };
                this.returnChargeChanged.emit(this.returnChargePayload);
            }
        });
        // this.returnChargePayload.em;
    }

    // /////////////////
    // Refactor
    // /////////////////
    openReturnChargeModal(): void {
        if (this.returnChargeForm.invalid) {
            return;
        }
        const dialogRef = this.dialogService.open(ShipmentRecordReturnChargeModalComponent, {
            width: '920px',
            height: 'auto',
            modal: true,
            closable: true,
            breakpoints: {
                '960px': '90vw',
                '640px': '95vw'
            },
            contentStyle: {
                'max-height': '90vh',
                overflow: 'auto'
            },
            data: {
                mode: this.mode,
                // initialValue: this.returnChargeDetail,
                folios: this.returnChargeForm.get('folio')?.value,
                storeDestinationsData: this.storeDestinationsData,
                homeDestinationsData: this.homeDestinationsData,
                currentItem: this.currentItem
            }
        });
        if (!dialogRef) {
            return;
        }
        this.dialogRef = dialogRef;

        dialogRef.onClose.pipe(takeUntil(this.destroy$)).subscribe((detail: ReturnChargeDetail | null) => {
            console.log(detail);
            if (detail) {
                this.returnChargeForm.get('destination')?.patchValue(detail?.destination);
                // this.applyReturnCharge(detail);
                return;
            }
            // this.syncReturnChargePayload();
        });
    }

    // buildPayload(detail: ReturnChargeDetail): CartItemDestinationPayload {
    //     const destinationType = detail.delivery_type;
    //     let destinationPayload: CartItemDestinationPayload = {};
    //     if (destinationType === DELIVERY_TYPE.HOME) {
    //         destinationPayload = {
    //             // ubigeo_id: this.destinationData.formValues?.ubigeo?.ubigeo_id,
    //             // address: this.destinationData.searchAddress?.address,
    //             // reference: this.destinationData.formValues?.references,
    //             // polygon: this.destinationData.searchAddress?.polygon,
    //             // office_id: 0,
    //             // delivery_type: this.destinationType
    //         };
    //     }
    //     return destinationPayload;
    // }

    // private applyReturnCharge(detail: ReturnChargeDetail) {
    //     // this.returnChargeDetail = {
    //     //     ...detail,
    //     //     folios: this.getNormalizedFolios()
    //     // };
    //
    //     console.log(detail);
    //     if (!this.returnChargeControl.value) {
    //         this.returnChargeControl.setValue(true, { emitEvent: false });
    //     }
    //     this.returnChargePayload = {
    //         ...detail.destination,
    //         folio: this.getNormalizedFolios()
    //     };
    //     this.returnChargeChanged.emit(this.returnChargePayload);
    //     // this.syncReturnChargePayload();
    // }

    // private clearReturnCharge() {
    //     this.returnChargeDetail = null;
    //     this.foliosControl.setValue(1, { emitEvent: false });
    //     this.cartSessionService.clearItemReturnCharge(this.itemIndex);
    //     this.returnChargeChanged.emit({ return_charge: false });
    // }

    // get hasReturnDestination(): boolean {
    //     if (!this.returnChargeDetail) {
    //         return false;
    //     }
    //     if (this.returnChargeDetail.delivery_type === DELIVERY_TYPE.HOME) {
    //         return !!this.returnChargeDetail.store?.destination?.ubigeo_id;
    //     }
    //     return !!this.returnChargeDetail.address?.searchAddress?.address;
    // }

    // get returnChargeAddress(): string {
    //     if (!this.returnChargeDetail) {
    //         return '';
    //     }
    //     if (this.returnChargeDetail.delivery_type === DELIVERY_TYPE.HOME) {
    //         return this.formatStoreAddress(this.returnChargeDetail.store);
    //     }
    //     return this.formatHomeAddress(this.returnChargeDetail.address);
    // }

    // get returnChargeReferences(): string | null {
    //     if (!this.returnChargeDetail) {
    //         return null;
    //     }
    //     if (this.returnChargeDetail.delivery_type === DELIVERY_TYPE.OFFICE) {
    //         return this.returnChargeDetail.store?.formValues?.additionalInfo?.trim() || null;
    //     }
    //     return this.returnChargeDetail.address?.formValues?.references?.trim() || null;
    // }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.dialogRef?.close();
    }

    // private seedFromStorage(): void {
    //     // const cartData = this.cartSessionService.getCartData();
    //     // const item = cartData.items?.[this.itemIndex];
    //     // if (!item?.return_charge) {
    //     //     return;
    //     // }
    //     // this.returnChargeControl.setValue(true, { emitEvent: false });
    //     // if (item.return_charge_detail) {
    //     //     this.returnChargeDetail = item.return_charge_detail;
    //     //     if (typeof item.return_charge_detail.folios === 'number') {
    //     //         this.foliosControl.setValue(this.getNormalizedFolios(item.return_charge_detail.folios), { emitEvent: false });
    //     //     }
    //     // }
    // }

    // private syncReturnChargePayload(): void {
    //     const payload: ReturnChargePayload = {
    //         return_charge: true,
    //         return_charge_detail: this.buildReturnChargeDetail()
    //     };
    //     // this.cartSessionService.setItemReturnCharge(this.itemIndex, payload);
    //     console.log(payload);
    //     this.returnChargeChanged.emit(payload);
    // }

    private getNormalizedFolios(value?: number): number {
        const rawValue = typeof value === 'number' ? value : this.foliosControl.value;
        const normalized = Number.isFinite(rawValue) ? Math.trunc(rawValue) : 1;
        if (normalized < 1) {
            return 1;
        }
        if (normalized > 3) {
            return 3;
        }
        return normalized;
    }

    // private formatHomeAddress(state?: DestinationAddressFormState): string {
    //     return state?.searchAddress?.address?.trim() || '';
    // }

    // private formatStoreAddress(state?: DestinationStoreFormState): string {
    //     const name = state?.destination?.headquarter_name?.trim();
    //     const address = state?.destination?.headquarter_address?.trim();
    //     return [name, address].filter(Boolean).join(', ');
    // }

    // private buildReturnChargeDetail(): ReturnChargeDetail {
    //     const baseDetail: ReturnChargeDetail = this.returnChargeDetail ?? {
    //         folios: this.getNormalizedFolios(),
    //         delivery_type: this.mode
    //     };
    //     return {
    //         ...baseDetail,
    //         folios: this.getNormalizedFolios()
    //     };
    // }

    get findStoreById(): DestinationEntityResponse {
        const headquarter_id = this.returnChargePayload.office_id;
        // console.log(headquarter_id);
        return <DestinationEntityResponse>this.storeDestinationsData.find((store) => (store?.office_id ?? 0) === headquarter_id);
    }

    protected readonly DELIVERY_TYPE = DELIVERY_TYPE;
}
