import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-home',
    host: {
        class: 'flex min-h-0 flex-1 flex-col'
    },
    imports: [RouterLink, NgOptimizedImage],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {}
