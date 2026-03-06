import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

class WizardDialogRefStub {
    constructor(private onCloseFn: (payload?: any) => void) {}
    close(payload?: any): void {
        this.onCloseFn(payload);
    }
}

@Component({
    selector: 'app-shipment-record-declaration-affidavit-modal',
    imports: [Button, Checkbox, ReactiveFormsModule],
    templateUrl: './shipment-record-declaration-affidavit-modal.component.html',
    styleUrl: './shipment-record-declaration-affidavit-modal.component.scss'
})
export class ShipmentRecordDeclarationAffidavitModalComponent implements OnInit {
    @Input() shipmentsToDeclare: Array<{ item: number; contenido: string; valor: string }> = [];
    @Input() stepDialogRef!: WizardDialogRefStub;
    @Output() accepted = new EventEmitter<boolean>();

    private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
    private readonly dynamicDialogRef = inject(DynamicDialogRef, { optional: true });
    private readonly fb = inject(FormBuilder);

    form!: FormGroup;

    constructor() {
        this.form = this.fb.group({
            checkRegulation: [false, Validators.requiredTrue],
            checkAffidavit: [false, Validators.requiredTrue]
        });
    }

    ngOnInit(): void {
        const data = this.dynamicDialogConfig?.data;
        if (data?.shipmentsToDeclare?.length) {
            this.shipmentsToDeclare = data.shipmentsToDeclare;
        }
    }

    get checkRegulation(): boolean {
        return this.form?.get('checkRegulation')?.value ?? false;
    }
    get checkAffidavit(): boolean {
        return this.form?.get('checkAffidavit')?.value ?? false;
    }

    next(): void {
        if (this.form?.valid) {
            if (this.dynamicDialogRef) {
                this.dynamicDialogRef.close(true);
            } else {
                this.accepted.emit(true);
            }
        }
    }

    close(): void {
        this.dynamicDialogRef?.close();
    }
}
