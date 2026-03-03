import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { InputOtp } from 'primeng/inputotp';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CartService } from '@shipment-record/services/cart.service';

@Component({
    selector: 'app-markup-shipment-record-pin-modal',
    imports: [InputOtp, Button, ReactiveFormsModule],
    templateUrl: './pin-modal.component.html',
    styleUrl: './pin-modal.component.scss',
    providers: [],
    standalone: true
})
export class PinModal implements OnInit {
    form!: FormGroup;
    formBuilder = inject(FormBuilder);
    cartSessionUuid = '';
    private readonly dynamicDialogRef = inject(DynamicDialogRef);
    private readonly dynamicDialogConfig = inject(DynamicDialogConfig);

    private readonly cartService = inject(CartService);
    // ✅ nuevo: si el componente está dentro del wizard
    @Input() embedded = false;

    // ✅ nuevo: el wizard escucha este evento
    @Output() pinSubmitted = new EventEmitter<string>();

    ngOnInit(): void {
        this.initPinForm();

        this.cartSessionUuid = this.dynamicDialogConfig.data?.cartUuid ?? {};
    }

    initPinForm() {
        this.form = this.formBuilder.group({
            pin: ['', [Validators.required]]
        });
    }

    next() {
        if (this.form.valid) {
            const pinValue: string = String(this.form.value.pin ?? '').trim();

            // embebido: no cerramos dialog, emitimos al wizard
            if (this.embedded) {
                this.pinSubmitted.emit(pinValue);
                return;
            }

            console.log('cartSessionUuid ingresado:', this.cartSessionUuid);
            console.log('PIN ingresado:', pinValue);
            // modal independiente (como antes)

            this.cartService.createPin(this.cartSessionUuid, pinValue).subscribe({
                next: (response) => {
                    this.dynamicDialogRef.close(pinValue);
                }
            });
        }
    }
}
