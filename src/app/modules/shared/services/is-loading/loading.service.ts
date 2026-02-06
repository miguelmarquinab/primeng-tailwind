import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingCount = 0;
    readonly #loadingSignal = signal<boolean>(false);
    loading = this.#loadingSignal.asReadonly();

    show() {
        this.loadingCount++;
        this.#loadingSignal.set(true);
    }

    hide() {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        if (this.loadingCount === 0) {
            // setTimeout(() => {
                this.#loadingSignal.set(false);
            // }, 500); // Espera 1 segundo antes de ocultar
        }
    }
}
