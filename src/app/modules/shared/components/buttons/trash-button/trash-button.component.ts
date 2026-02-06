import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-trash-button',
    imports: [NgClass],
    templateUrl: './trash-button.component.html',
    styleUrl: './trash-button.component.scss',
    encapsulation: ViewEncapsulation.None,
    standalone: true
})
export class TrashButtonComponent {
    @Output() clicked = new EventEmitter<void>();

    click(event: any) {
        this.clicked.emit();
    }
}
