import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ShipmentRecordReturnChargeModalComponent } from '@shipment-record/steps/components/step2/shipment-record-return-charge-modal/shipment-record-return-charge-modal.component';
import { ReturnChargeDetail, ReturnChargeMode, ReturnChargePayload } from '@shipment-record/models/return-charge.model';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { InputNumber } from 'primeng/inputnumber';
import { DestinationAddressFormState, DestinationStoreFormState } from '@shipment-record/models/destination-form.model';
import { BreakpointService } from '@shared/services/breakpoint/breakpoint.service';

@Component({
    selector: 'app-shipment-record-return-charge-toggle',
    imports: [ReactiveFormsModule, ToggleSwitch, TranslateModule, InputNumber],
    templateUrl: './shipment-record-return-charge-toggle.component.html',
    styleUrl: './shipment-record-return-charge-toggle.component.scss',
    providers: [DialogService]
})
export class ShipmentRecordReturnChargeToggleComponent implements OnInit, OnDestroy {
    @Input() mode: ReturnChargeMode = 'home';
    @Input() itemIndex = 0;
    @Output() returnChargeChanged = new EventEmitter<ReturnChargePayload>();

    returnChargeControl = new FormControl(false, { nonNullable: true });
    foliosControl = new FormControl(1, {
        nonNullable: true,
        validators: [Validators.min(1), Validators.max(3)]
    });
    returnChargeDetail: ReturnChargeDetail | null = null;
    private dialogRef: DynamicDialogRef | null = null;
    private readonly dialogService = inject(DialogService);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly breakpointService = inject(BreakpointService);
    isMobile = this.breakpointService.isMobile;
    private readonly destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.seedFromStorage();
        this.returnChargeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((enabled) => {
            if (enabled) {
                this.syncReturnChargePayload();
                return;
            }
            this.clearReturnCharge();
        });

        this.foliosControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (!this.returnChargeControl.value) {
                return;
            }
            if (this.returnChargeDetail) {
                this.returnChargeDetail = {
                    ...this.returnChargeDetail,
                    folios: this.getNormalizedFolios()
                };
            }
            this.syncReturnChargePayload();
        });
    }

    openReturnChargeModal(): void {
        if (!this.returnChargeControl.value) {
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
                initialValue: this.returnChargeDetail,
                folios: this.getNormalizedFolios()
            }
        });
        if (!dialogRef) {
            return;
        }
        this.dialogRef = dialogRef;

        dialogRef.onClose.pipe(takeUntil(this.destroy$)).subscribe((detail: ReturnChargeDetail | null) => {
            if (detail) {
                this.applyReturnCharge(detail);
                return;
            }
            this.syncReturnChargePayload();
        });
    }

    private applyReturnCharge(detail: ReturnChargeDetail) {
        this.returnChargeDetail = {
            ...detail,
            folios: this.getNormalizedFolios()
        };
        if (!this.returnChargeControl.value) {
            this.returnChargeControl.setValue(true, { emitEvent: false });
        }
        this.syncReturnChargePayload();
    }

    private clearReturnCharge() {
        this.returnChargeDetail = null;
        this.foliosControl.setValue(1, { emitEvent: false });
        this.cartSessionService.clearItemReturnCharge(this.itemIndex);
        this.returnChargeChanged.emit({ return_charge: false });
    }

    get hasReturnDestination(): boolean {
        if (!this.returnChargeDetail) {
            return false;
        }
        if (this.returnChargeDetail.destinationType === 'store') {
            return !!this.returnChargeDetail.store?.destination?.ubigeo_id;
        }
        return !!this.returnChargeDetail.address?.searchAddress?.address;
    }

    get returnChargeAddress(): string {
        if (!this.returnChargeDetail) {
            return '';
        }
        if (this.returnChargeDetail.destinationType === 'store') {
            return this.formatStoreAddress(this.returnChargeDetail.store);
        }
        return this.formatHomeAddress(this.returnChargeDetail.address);
    }

    get returnChargeReferences(): string | null {
        if (!this.returnChargeDetail) {
            return null;
        }
        if (this.returnChargeDetail.destinationType === 'store') {
            return this.returnChargeDetail.store?.formValues?.additionalInfo?.trim() || null;
        }
        return this.returnChargeDetail.address?.formValues?.references?.trim() || null;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.dialogRef?.close();
    }

    private seedFromStorage(): void {
        const cartData = this.cartSessionService.getCartData();
        const item = cartData.items?.[this.itemIndex];
        if (!item?.return_charge) {
            return;
        }
        this.returnChargeControl.setValue(true, { emitEvent: false });
        if (item.return_charge_detail) {
            this.returnChargeDetail = item.return_charge_detail;
            if (typeof item.return_charge_detail.folios === 'number') {
                this.foliosControl.setValue(this.getNormalizedFolios(item.return_charge_detail.folios), { emitEvent: false });
            }
        }
    }

    private syncReturnChargePayload(): void {
        const payload: ReturnChargePayload = {
            return_charge: true,
            return_charge_detail: this.buildReturnChargeDetail()
        };
        this.cartSessionService.setItemReturnCharge(this.itemIndex, payload);
        this.returnChargeChanged.emit(payload);
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

    private formatHomeAddress(state?: DestinationAddressFormState): string {
        return state?.searchAddress?.address?.trim() || '';
    }

    private formatStoreAddress(state?: DestinationStoreFormState): string {
        const name = state?.destination?.headquarter_name?.trim();
        const address = state?.destination?.headquarter_address?.trim();
        return [name, address].filter(Boolean).join(', ');
    }

    private buildReturnChargeDetail(): ReturnChargeDetail {
        const baseDetail: ReturnChargeDetail = this.returnChargeDetail ?? {
            folios: this.getNormalizedFolios(),
            destinationType: this.mode
        };
        return {
            ...baseDetail,
            folios: this.getNormalizedFolios()
        };
    }
}
