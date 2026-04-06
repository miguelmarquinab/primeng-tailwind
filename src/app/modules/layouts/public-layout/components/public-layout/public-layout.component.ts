import { Component, OnDestroy, effect, EffectRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicLayoutHeaderComponent } from '../public-layout-header/public-layout-header.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
    selector: 'app-public-layout',
    imports: [RouterOutlet, PublicLayoutHeaderComponent, ToastModule],
    templateUrl: './public-layout.component.html',
    styleUrl: './public-layout.component.scss',
    providers: [MessageService]
})
export class PublicLayoutComponent implements OnDestroy {
    private stopToastEffect!: EffectRef;

    constructor(private readonly messageService: MessageService, private readonly toastService: ToastService) {
        // Crear un efecto que reaccione a cambios en la señal y muestre el toast con PrimeNG
        this.stopToastEffect = effect(() => {
            const toast = this.toastService.toastSignal();
            if (toast) {
                this.messageService.add({ severity: toast.severity, summary: toast.summary ?? '', detail: toast.detail });
                // Limpiar para evitar mostrarlo nuevamente
                this.toastService.clearToast();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.stopToastEffect) {
            // EffectRef dispone del método destroy() para limpiar el efecto
            this.stopToastEffect.destroy();
        }
    }
}
