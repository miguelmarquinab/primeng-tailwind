import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

import { SessionStorageService } from '@shared/services/storage/session-storage.service';
import { PinModal } from '../shipment-record-pin-modal/pin-modal.component';
import { PaymentMethodModalComponent } from '@shared/payment-method-modal/payment-method-modal.component';
import { ShipmentRecordDeclarationAffidavitModalComponent } from '../shipment-record-declaration-affidavit-modal/shipment-record-declaration-affidavit-modal.component';
import { CartItemEntityResponse } from '@shipment-record/models/cart-item.model';

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

    private readonly FORCE_AFFIDAVIT = false;

    currentStep: FinalStep = 'PIN';
    totalSteps: 2 | 3 = 2;

    pinValue: string | null = null;
    shipmentsToDeclare: ShipmentToDeclare[] = [];
    /** Cart items to pass to declaration modal when total >= 500. */
    cartItemsForAffidavit: CartItemEntityResponse[] = [];

    ngOnInit(): void {
        const cartData = this.getCartData();
        const hasAffidavitPreview = this.hasDeclarationAffidavit(cartData);
        this.totalSteps = hasAffidavitPreview ? 3 : 2;
    }

    onPinSubmitted(pin: string): void {
        this.pinValue = pin;

        const cartData = this.getCartData();
        const hasAffidavit = this.FORCE_AFFIDAVIT ? true : this.hasDeclarationAffidavit(cartData);
        const shipments = this.buildShipmentsToDeclare(cartData);

        console.log('cartData:', cartData);
        console.log('items:', cartData?.items);

        this.shipmentsToDeclare = hasAffidavit ? shipments : [];
        this.cartItemsForAffidavit = hasAffidavit ? (cartData?.items ?? []) : [];

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

    private getCartData(): any {
        return this.sessionStorageService.get(this.CART_DATA_KEY);
    }

    private hasDeclarationAffidavit(cartData: any): boolean {
        return this.getCartTotalNumber(cartData) >= 500;
    }

    private getCartTotalNumber(cartData: any): number {
        const total = cartData?.total ?? cartData?.summary?.total;

        if (total != null && typeof total === 'number') {
            return total;
        }

        const items = cartData?.items ?? [];
        return items.reduce((sum: number, item: any) => {
            return sum + Number(item?.pricing?.amount ?? item?.amount ?? 0);
        }, 0);
    }

    private buildShipmentsToDeclare(cartData: any): ShipmentToDeclare[] {
        const items = cartData?.items ?? [];

        return items.map((item: any, idx: number): ShipmentToDeclare => {
            const amount = Number(item?.pricing?.amount ?? item?.amount ?? 0);
            const declared = Number(item?.declared_value ?? 0) || Number(item?.what_send?.declared_value ?? 0);
            const articleId = item?.article_id ?? item?.what_send?.article_id;

            return {
                item: idx + 1,
                contenido: articleId ? `Artículo ${articleId}` : `Envío ${idx + 1}`,
                valor: `S/${(amount || declared).toFixed(2)}`
            };
        });
    }

    get currentStepIndex(): 1 | 2 | 3 {
        if (this.currentStep === 'PIN') {
            return 1;
        }

        if (this.currentStep === 'AFFIDAVIT') {
            return 2;
        }

        return this.totalSteps === 3 ? 3 : 2;
    }

    // get paymentAmount(): string {
    //     const cartData = this.getCartData();
    //     const total = this.getCartTotalNumber(cartData);
    //
    //     if (total > 0) {
    //         return `S/${total.toFixed(2)}`;
    //     }
    //
    //     return 'S/0.00';
    // }
    get paymentAmount(): number {
        const cartData = this.getCartData();
        const total = this.getCartTotalNumber(cartData);
        return total > 0 ? total : 0;
    }
}
