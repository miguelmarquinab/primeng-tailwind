import { Component, inject, input, output } from '@angular/core';
import { CartService } from '@shipment-record/services/cart.service';
import { ConfirmationService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-cart-item-delete-button',
    imports: [],
    templateUrl: './cart-item-delete-button.component.html',
    styleUrl: './cart-item-delete-button.component.scss'
})
export class CartItemDeleteButtonComponent {
    deleteSuccess = output<any>();
    cartUuid = input.required<string>();
    cartItemUuid = input.required<string>();
    cartService = inject(CartService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly destroy$ = new Subject<void>();

    deleteItem(event:any) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: '<span class="font-montserrat">¿Deseas eliminar el envío?</span>',
            header: '¿Quieres borrar el envío?',
            icon: 'pi pi-exclamation-triangle',

            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Aceptar',
                severity: 'primary'
            },

            accept: () => {
                this.cartService
                    .deleteItem(this.cartUuid(), this.cartItemUuid())
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.deleteSuccess.emit(true);
                        }
                    });
            }
        });
    }
}
