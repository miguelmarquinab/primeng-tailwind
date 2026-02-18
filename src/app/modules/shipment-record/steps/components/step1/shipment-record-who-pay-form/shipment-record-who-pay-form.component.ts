import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Message } from 'primeng/message';
import { RadioButton } from 'primeng/radiobutton';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';
import { CartService } from '@shipment-record/services/cart.service';
import { Subject } from 'rxjs';
import { ShipmentRecordStepsConstant } from '@shipment-record/contansts/shipment-record-step.constant';
import { JsonPipe, NgClass } from '@angular/common';
import { HeadquartersEntityResponse, PaymentModalities } from '@shipment-record/models/headquarters.model';

@Component({
    selector: 'app-shipment-record-who-pay-form',
    imports: [Button, Message, RadioButton, ReactiveFormsModule, NgClass],
    templateUrl: './shipment-record-who-pay-form.component.html',
    styleUrl: './shipment-record-who-pay-form.component.scss'
})
export class ShipmentRecordWhoPayFormComponent implements OnInit, OnChanges, OnDestroy {
    whoPayForm!: FormGroup;
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly cartSessionService = inject(CartSessionStorageService);
    private readonly cartService = inject(CartService);
    private readonly destroy$ = new Subject<void>();

    @Input() currentHeadquarter!: HeadquartersEntityResponse;

    whoPayTypeEnabled: any[] = [ShipmentRecordStepsConstant.WHO_PAY_TYPE_ONLINE, ShipmentRecordStepsConstant.WHO_PAY_TYPE_DESTINATION, ShipmentRecordStepsConstant.WHO_PAY_TYPE_STORE];

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.whoPayForm = this.formBuilder.group({
            paymentType: ['ONLINE']
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['currentHeadquarter'] && changes['currentHeadquarter'].currentValue) {
            const headquarter: HeadquartersEntityResponse = changes['currentHeadquarter'].currentValue;
            // this.whoPayTypeEnabled = this.buildWhoPayTypeEnabled(headquarter);
            this.whoPayTypeEnabled = this.orderPaymentModalities(headquarter.payment_modalities ?? []);

            console.log('this.whoPayTypeEnabled', this.whoPayTypeEnabled);
        }
    }

    orderPaymentModalities(paymentModalities: PaymentModalities[] = []): PaymentModalities[] {
        return paymentModalities.sort((a, b) => {
            return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        });
    }

    buildWhoPayTypeEnabled(headquarter: HeadquartersEntityResponse) {
        let whoPayTypeEnabled = [ShipmentRecordStepsConstant.WHO_PAY_TYPE_ONLINE];

        // @TODO fix with conditional in previus section

        if (headquarter) {
            whoPayTypeEnabled.push(ShipmentRecordStepsConstant.WHO_PAY_TYPE_DESTINATION);
        }

        if (headquarter) {
            whoPayTypeEnabled.push(ShipmentRecordStepsConstant.WHO_PAY_TYPE_STORE);
        }

        return whoPayTypeEnabled;
    }

    handleSubmit() {
        if (this.whoPayForm.valid) {
            // const sessionUuid = this.cartSessionService.getCardId();
            // if (!sessionUuid) {
            //     return;
            // }
            // const payload = this.cartSessionService.buildCartPayload();
            // this.cartService
            //     .update(sessionUuid, payload)
            //     .pipe(takeUntil(this.destroy$))
            //     .subscribe({
            //         next: () => {
            this.cartService.setStepNumber(2);
            //     }
            // });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
