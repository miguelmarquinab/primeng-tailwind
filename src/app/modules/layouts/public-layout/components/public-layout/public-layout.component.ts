import { Component, OnDestroy, effect, EffectRef, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { filter, map, startWith } from 'rxjs';

import { PublicLayoutHeaderComponent } from '../public-layout-header/public-layout-header.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToastService } from '@shared/services/toast/toast.service';
import { BreakpointService } from '@/modules/shared/services/breakpoint/breakpoint.service';

@Component({
    selector: 'app-public-layout',
    imports: [NgClass, RouterOutlet, PublicLayoutHeaderComponent, ToastModule],
    templateUrl: './public-layout.component.html',
    styleUrl: './public-layout.component.scss',
    providers: [MessageService]
})
export class PublicLayoutComponent implements OnDestroy {
    private readonly router = inject(Router);
    private readonly breakpoint = inject(BreakpointService);

    private readonly currentUrl = toSignal(
        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map(() => this.router.url),
            startWith(this.router.url)
        ),
        { initialValue: this.router.url }
    );

    readonly lockShipmentStep3OuterScroll = computed(() => {
        const url = this.currentUrl();
        return this.breakpoint.isMobile() && /\/shipment-record\/step\/3(?:\/|$|\?|#)/.test(url);
    });
    private stopToastEffect!: EffectRef;

    constructor(
        private readonly messageService: MessageService,
        private readonly toastService: ToastService
    ) {
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
