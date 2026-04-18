import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ShipmentRecordReturnChargeModalComponent } from '@shipment-record/steps/components/step2/shipment-record-return-charge-modal/shipment-record-return-charge-modal.component';
import { ReturnChargeDetail } from '@shipment-record/models/return-charge.model';
import { InputNumber } from 'primeng/inputnumber';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';
import { CartItemDestinationFormState, CartItemEntityResponse, CartItemReturnChargePayload } from '@shipment-record/models/cart-item.model';
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

        console.log('this.storeDestinationsData', this.storeDestinationsData);
        console.log('this.homeDestinationsData', this.homeDestinationsData);
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.dialogRef?.close();
    }

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

    get findStoreById(): DestinationEntityResponse {
        const headquarter_id = this.returnChargePayload.office_id;
        // console.log(headquarter_id);
        return <DestinationEntityResponse>this.storeDestinationsData.find((store) => (store?.office_id ?? 0) === headquarter_id);
    }

    protected readonly DELIVERY_TYPE = DELIVERY_TYPE;
}
