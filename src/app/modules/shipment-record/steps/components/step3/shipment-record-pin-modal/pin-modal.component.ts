import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { InputOtp } from 'primeng/inputotp';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CartService } from '@shipment-record/services/cart.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-markup-shipment-record-pin-modal',
    imports: [InputOtp, Button, ReactiveFormsModule],
    templateUrl: './pin-modal.component.html',
    styleUrl: './pin-modal.component.scss',
    providers: [],
    standalone: true
})
export class PinModal implements OnInit, OnDestroy {
    form!: FormGroup;
    formBuilder = inject(FormBuilder);
    cartSessionUuid = '';
    private readonly dynamicDialogRef = inject(DynamicDialogRef, { optional: true });
    private readonly dynamicDialogConfig = inject(DynamicDialogConfig, { optional: true });
    private readonly destroy$ = new Subject<void>();

    private readonly cartService = inject(CartService);

    @Input() embedded = false;

    @Output() pinSubmitted = new EventEmitter<string>();

    /** 2 pasos (PIN + pago) o 3 pasos (PIN + declaración jurada + pago). Solo cuando no está embebido. */
    totalSteps: 2 | 3 = 2;

    ngOnInit(): void {
        this.initPinForm();
        const data = this.dynamicDialogConfig?.data ?? {};
        this.cartSessionUuid = data.cartUuid ?? '';
        this.totalSteps = data.hasDeclaracionPreview === true ? 3 : 2;
        this.form.get('pin')?.valueChanges?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.pinError = null;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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
                    console.log('PIN creado exitosamente:', response);
                    this.pinError = null;
                    this.dynamicDialogRef?.close(pinValue);
                },
                error: () => {
                    this.pinError = 'Clave inválida: No uses número consecutivos (1234) o patrones simples (1111)';
                }
            });
        }
    }

    close(): void {
        this.dynamicDialogRef?.close();
    }

    /** Mensaje de error al validar PIN (API o cliente). */
    pinError: string | null = null;
}
