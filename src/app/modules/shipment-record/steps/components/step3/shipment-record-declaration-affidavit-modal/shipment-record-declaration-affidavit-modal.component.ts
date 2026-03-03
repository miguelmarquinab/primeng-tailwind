import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';

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
export class ShipmentRecordDeclarationAffidavitModalComponent {
    @Input() shipmentsToDeclare: Array<{ item: number; contenido: string; valor: string }> = [];
    @Input() stepDialogRef!: WizardDialogRefStub;
    @Output() accepted = new EventEmitter<boolean>();

    checkRegulation = false;
    checkAffidavit = false;

    next(): void {
        if (this.checkRegulation && this.checkAffidavit) {
            this.accepted.emit(true);
        }
    }
}
