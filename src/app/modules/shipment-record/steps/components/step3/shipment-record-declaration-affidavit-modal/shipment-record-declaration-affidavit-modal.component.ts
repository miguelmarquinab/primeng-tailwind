import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';

class WizardDialogRefStub {
    constructor(private onCloseFn: (payload?: any) => void) {}

    close(payload?: any): void {
        this.onCloseFn(payload);
    }
}

@Component({
    selector: 'app-shipment-record-declaration-affidavit-modal',
    imports: [Button, FormsModule],
    templateUrl: './shipment-record-declaration-affidavit-modal.component.html',
    styleUrl: './shipment-record-declaration-affidavit-modal.component.scss'
})
export class ShipmentRecordDeclarationAffidavitModalComponent implements OnInit {
    @Input() shipmentsToDeclare: CartItemEntityResponse[] = [];
    @Input() stepDialogRef!: WizardDialogRefStub;
    @Output() accepted = new EventEmitter<boolean>();

    private readonly dynamicDialogConfig = inject(DynamicDialogConfig, { optional: true });
    private readonly dynamicDialogRef = inject(DynamicDialogRef, { optional: true });

    checkRegulation = false;
    checkAffidavit = false;

    ngOnInit(): void {
        const data = this.dynamicDialogConfig?.data;
        console.log('Data recibida en el modal:', data);
        if (data?.shipmentsToDeclare?.length) {
            this.shipmentsToDeclare = data.shipmentsToDeclare;
        }
    }

    next(): void {
        if (!this.checkRegulation || !this.checkAffidavit) {
            return;
        }

        if (this.dynamicDialogRef) {
            this.dynamicDialogRef.close(true);
            return;
        }

        if (this.stepDialogRef) {
            this.stepDialogRef.close(true);
            return;
        }

        this.accepted.emit(true);
    }

    close(): void {
        if (this.dynamicDialogRef) {
            this.dynamicDialogRef.close();
            return;
        }

        if (this.stepDialogRef) {
            this.stepDialogRef.close();
        }
    }
}
