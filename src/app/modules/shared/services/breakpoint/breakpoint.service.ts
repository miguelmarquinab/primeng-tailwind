import { computed, Injectable, signal } from '@angular/core';
import { debounceTime, fromEvent } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BreakpointService {
    private readonly windowWidth = signal(this.getWindowWidth());

    // Breakpoints de Tailwind
    readonly isMobile = computed(() => this.windowWidth() < 1024);
    readonly isTablet = computed(() => this.windowWidth() >= 768 && this.windowWidth() < 1024);
    readonly isDesktop = computed(() => this.windowWidth() >= 1024);

    constructor() {
        this.setupResizeListener();
    }

    private setupResizeListener() {
        fromEvent(globalThis, 'resize')
            .pipe(debounceTime(100))
            .subscribe(() => {
                this.windowWidth.set(this.getWindowWidth());
            });
    }

    private getWindowWidth(): number {
        const gw = globalThis as any;
        return typeof gw?.innerWidth === 'number' ? gw.innerWidth : 1024;

    }
}
