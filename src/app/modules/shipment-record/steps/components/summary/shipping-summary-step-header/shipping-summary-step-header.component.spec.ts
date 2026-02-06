import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingSummaryStepHeaderComponent } from './shipping-summary-step-header.component';

describe('ShippingSummaryStepHeaderComponent', () => {
    let component: ShippingSummaryStepHeaderComponent;
    let fixture: ComponentFixture<ShippingSummaryStepHeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ShippingSummaryStepHeaderComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ShippingSummaryStepHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
