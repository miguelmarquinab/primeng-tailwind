import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Message } from 'primeng/message';
import { RadioButton } from 'primeng/radiobutton';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { CartService } from '@shipment-record/services/cart.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-shipment-record-who-pay-form',
    imports: [Button, Message, RadioButton, ReactiveFormsModule],
    templateUrl: './shipment-record-who-pay-form.component.html',
    styleUrl: './shipment-record-who-pay-form.component.scss'
})
export class ShipmentRecordWhoPayFormComponent implements OnInit, OnDestroy {
    whoPayForm!: FormGroup;
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly cartService = inject(CartService);
    private readonly destroy$ = new Subject<void>();
    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.whoPayForm = this.formBuilder.group({
            paymentType: ['online']
        });
    }

    handleSubmit() {
        if (this.whoPayForm.valid) {
            const sessionUuid = this.cartSessionService.getCartId();
            if (!sessionUuid) {
                return;
            }
            const payload = this.cartSessionService.buildCartPayload();
            this.cartService
                .update(sessionUuid, payload)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.cartService.setStepNumber(3);
                    }
                });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
