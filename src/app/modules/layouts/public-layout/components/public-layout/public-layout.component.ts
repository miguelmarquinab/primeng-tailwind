import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicLayoutHeaderComponent } from '../public-layout-header/public-layout-header.component';

@Component({
    selector: 'app-public-layout',
    imports: [RouterOutlet, PublicLayoutHeaderComponent],
    templateUrl: './public-layout.component.html',
    styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent {}
