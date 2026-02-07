import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Step, StepList, Stepper } from 'primeng/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { CartSessionStorageService } from '@shipment-record/services/cart-session-storage.service';

import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-shipment-record-steps',
    imports: [Stepper, StepList, Step, ButtonModule],
    templateUrl: './shipment-record-steps.component.html',
    styleUrl: './shipment-record-steps.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ShipmentRecordStepsComponent implements OnInit, OnChanges {
    @Input() stepNumber!: number;
    @Output() resetFlow = new EventEmitter<void>();
    stepChanged = output<number>();
    stepsDisabled = [false, true, true];
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly cartSessionService = inject(CartSessionStorageService);
    constructor() {
        const raw = this.route.snapshot.paramMap.get('stepNumber');
        this.stepNumber = Number(raw);

        if (this.stepNumber === 0) {
            this.stepChangeHandler(this.stepNumber);
        }
    }
    ngOnInit() {
        let currentStep = this.cartSessionService.getCurrentStep();
        if (!currentStep) {
            currentStep = this.stepNumber;
        }

        this.stepChangeHandler(currentStep);
    }

    stepChangeHandler(stepNumber: number) {
        this.stepNumber = stepNumber;
        this.stepChanged.emit(this.stepNumber);
        this.updateRoute(stepNumber);
        this.enableStep(stepNumber);
    }

    updateRoute(stepNumber: number) {
        this.router.navigate(['../', stepNumber], { relativeTo: this.route, replaceUrl: true });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['stepNumber'] && !changes['stepNumber'].firstChange) {
            this.stepNumber = changes['stepNumber'].currentValue;
            this.updateRoute(this.stepNumber);
            this.enableStep(this.stepNumber);
        }
    }

    enableStep(step: number) {
        console.log('enableStep:', step);
        console.log('Enabling step:', step);
        this.stepsDisabled = this.stepsDisabled.map(() => true);
        this.stepsDisabled[step - 1] = false;
    }
}
