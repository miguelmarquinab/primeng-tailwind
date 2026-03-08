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
        if (data && Array.isArray(data.shipmentsToDeclare)) {
            this.shipmentsToDeclare = data.shipmentsToDeclare;
        }
    }

    /** Contenido to show for table (description or fallback). */
    getItemContenido(s: CartItemEntityResponse, index: number): string {
        const desc = s.what_send?.article_category?.description ?? s.what_send?.article_category?.name;
        if (desc) return desc;
        const articleId = s.what_send?.article_id;
        if (articleId != null) return `Artículo ${articleId}`;
        return `Envío ${index + 1}`;
    }

    /** Formatted declared value. */
    getItemValor(s: CartItemEntityResponse): string {
        const val = Number(s.what_send?.declared_value ?? 0);
        return `S/ ${val.toFixed(2)}`;
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
