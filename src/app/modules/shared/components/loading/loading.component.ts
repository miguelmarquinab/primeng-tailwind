import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-loading',
    imports: [NgOptimizedImage],
    templateUrl: './loading.component.html',
    standalone: true,
    styleUrl: './loading.component.scss'
})
export class LoadingComponent {}
