import { Component, inject, OnInit } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { environment } from '@env/environment';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App implements OnInit {
    env = environment;
    private readonly translateService = inject(TranslateService);
    constructor(private readonly primeng: PrimeNG) {}

    ngOnInit() {
        this.primeng.ripple.set(true);
        this.translate('es');
    }
    translate(lang: string) {
        this.translateService.use(lang);
        this.translateService.get('primeng').subscribe((res) => {
            this.primeng.setTranslation(res);
        });
    }
}
