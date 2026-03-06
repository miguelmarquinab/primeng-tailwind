import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { Router } from '@angular/router';

import { SessionStorageService } from '@shared/services/storage/session-storage.service';
import { PinModal } from '../shipment-record-pin-modal/pin-modal.component';
import { PaymentMethodModalComponent } from '@shared/payment-method-modal/payment-method-modal.component';
import { ShipmentRecordDeclarationAffidavitModalComponent } from '../shipment-record-declaration-affidavit-modal/shipment-record-declaration-affidavit-modal.component';

type FinalStep = 'PIN' | 'AFFIDAVIT' | 'PAYMENT';

interface ShipmentToDeclare {
    item: number;
    contenido: string;
    valor: string;
}

@Component({
    selector: 'app-shipment-record-final-steps-modal',
    standalone: true,
    imports: [NgClass, Button, PinModal, ShipmentRecordDeclarationAffidavitModalComponent, PaymentMethodModalComponent],
    templateUrl: './shipment-record-final-steps-modal.component.html',
    styleUrl: './shipment-record-final-steps-modal.component.scss'
})
export class ShipmentRecordFinalStepsModalComponent implements OnInit {
    private readonly dialogRef = inject(DynamicDialogRef);
    private readonly sessionStorageService = inject(SessionStorageService);
    private readonly router = inject(Router);

    private readonly CART_DATA_KEY = 'cartData';

    currentStep: FinalStep = 'PIN';
    totalSteps: 2 | 3 = 2;

    pinValue: string | null = null;
    shipmentsToDeclare: ShipmentToDeclare[] = [];

    ngOnInit(): void {
        const cartData = this.sessionStorageService.get(this.CART_DATA_KEY);
        const hasAffidavitPreview = this.hasDeclarationAffidavit(cartData);
        this.totalSteps = hasAffidavitPreview ? 3 : 2;
    }

    // ===== events from children (independencia) =====

    onPinSubmitted(pin: string): void {
        this.pinValue = pin;

        // Aquí luego irá tu endpoint real para “obtener predios / envíos”.
        // Por ahora lo tomamos de sessionStorage (tu estándar actual).
        const cartData = this.sessionStorageService.get(this.CART_DATA_KEY);

        const hasAffidavit = this.hasDeclarationAffidavit(cartData);

        this.shipmentsToDeclare = hasAffidavit ? this.buildShipmentsToDeclare(cartData) : [];

        this.totalSteps = hasAffidavit ? 3 : 2;
        this.currentStep = hasAffidavit ? 'AFFIDAVIT' : 'PAYMENT';
    }

    onAffidavitAccepted(accepted: boolean): void {
        if (accepted) {
            this.currentStep = 'PAYMENT';
        }
    }

    onPaymentConfirmed(payload: { paymentMethod: 'niubiz' | 'pagoefectivo'; termsAccepted: boolean }): void {
        this.dialogRef.close(payload);
    }

    onGoToFinish(): void {
        this.dialogRef.close();
        this.router.navigate(['/shipment-record/finish']);
    }

    close(): void {
        this.dialogRef.close();
    }

    // ===== helpers =====

    private hasDeclarationAffidavit(cartData: any): boolean {
        return this.getCartTotalNumber(cartData) >= 500;
    }

    private getCartTotalNumber(cartData: any): number {
        const total = cartData?.total ?? cartData?.summary?.total;
        if (total != null && typeof total === 'number') return total;
        const items = cartData?.items ?? [];
        return items.reduce((sum: number, it: any) => sum + (Number(it?.pricing?.amount ?? it?.amount ?? 0)), 0);
    }

    private buildShipmentsToDeclare(cartData: any): ShipmentToDeclare[] {
        const items = cartData?.items ?? [];

        return items
            .map((x: any, idx: number): ShipmentToDeclare => {
                const declared = Number(x?.declared_value ?? 0) || Number(x?.what_send?.declared_value ?? 0);

                const articleId = x?.article_id ?? x?.what_send?.article_id;

                return {
                    item: idx + 1,
                    contenido: articleId ? `Artículo ${articleId}` : `Envío ${idx + 1}`,
                    valor: `S/${declared.toFixed(2)}`
                };
            })
            .filter((row: ShipmentToDeclare) => {
                const num = Number(String(row.valor).replace('S/', ''));
                return num >= 500;
            });
    }

    get currentStepIndex(): 1 | 2 | 3 {
        if (this.currentStep === 'PIN') return 1;
        if (this.currentStep === 'AFFIDAVIT') return 2;
        return this.totalSteps === 3 ? 3 : 2;
    }

    get paymentAmount(): string {
        const cartData = this.sessionStorageService.get(this.CART_DATA_KEY);
        const total = this.getCartTotalNumber(cartData);
        if (total > 0) return `S/${total.toFixed(2)}`;
        return 'S/0.00';
    }
}
