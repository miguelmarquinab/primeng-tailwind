import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
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
    imports: [NgClass, PinModal, ShipmentRecordDeclarationAffidavitModalComponent, PaymentMethodModalComponent],
    templateUrl: './shipment-record-final-steps-modal.component.html',
    styleUrl: './shipment-record-final-steps-modal.component.scss'
})
export class ShipmentRecordFinalStepsModalComponent implements OnInit {
    private readonly dialogRef = inject(DynamicDialogRef);
    private readonly sessionStorageService = inject(SessionStorageService);
    private readonly router = inject(Router);

    private readonly CART_DATA_KEY = 'cartData';

    private readonly FORCE_AFFIDAVIT = true;

    currentStep: FinalStep = 'PIN';
    totalSteps: 2 | 3 = 2;

    pinValue: string | null = null;
    shipmentsToDeclare: ShipmentToDeclare[] = [];

    ngOnInit(): void {
        // “Preview” para pintar la barra desde el inicio (como tu prototipo)
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

        //const hasAffidavit = this.hasDeclarationAffidavit(cartData);
        // ✅ fuerza para pruebas
        const hasAffidavit = this.FORCE_AFFIDAVIT ? true : this.hasDeclarationAffidavit(cartData);

        //this.shipmentsToDeclare = this.buildShipmentsToDeclare(cartData);
        // ✅ si no hay data real, al menos mostramos 1 fila fake para ver el modal

        console.log('cartData:', cartData);
        console.log('items:', cartData?.items);

        this.shipmentsToDeclare = hasAffidavit
            ? (this.buildShipmentsToDeclare(cartData).length
                ? this.buildShipmentsToDeclare(cartData)
                : [{ item: 1, contenido: 'Celular', valor: 'S/600.00' }])
            : [];

        this.totalSteps = hasAffidavit ? 3 : 2;
        this.currentStep = hasAffidavit ? 'AFFIDAVIT' : 'PAYMENT';
    }

    onAffidavitAccepted(accepted: boolean): void {
        if (accepted) {
            this.currentStep = 'PAYMENT';
        }
    }

    onPaymentConfirmed(payload: { paymentMethod: 'niubiz' | 'pagoefectivo'; termsAccepted: boolean }): void {
        // Cierra wizard y devuelve data al caller (ShippingSummary)
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
        const items = cartData?.items ?? [];
        //return items.some((x: any) => Number(x?.declared_value ?? 0) >= 500);
        return items.some((x: any) => {
            const declared = Number(x?.declared_value ?? 0) || Number(x?.what_send?.declared_value ?? 0); // ✅ soporte si viene anidado

            return declared >= 500;
        });
    }

    private buildShipmentsToDeclare(cartData: any): ShipmentToDeclare[] {
        const items = cartData?.items ?? [];

        // return items
        //     .map(
        //         (x: any, idx: number): ShipmentToDeclare => ({
        //             item: idx + 1,
        //             contenido: x?.article_id ? `Artículo ${x.article_id}` : `Envío ${idx + 1}`,
        //             valor: `S/${Number(x?.declared_value ?? 0).toFixed(2)}`
        //         })
        //     )
        //     .filter((row: ShipmentToDeclare) => {
        //         const num = Number(String(row.valor).replace('S/', ''));
        //         return num >= 500;
        //     });
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
}
