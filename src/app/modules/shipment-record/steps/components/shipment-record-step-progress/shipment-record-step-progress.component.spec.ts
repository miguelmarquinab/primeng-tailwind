import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordStepProgressComponent } from './shipment-record-step-progress.component';

describe('ShipmentRecordStepProgressComponent', () => {
    let component: ShipmentRecordStepProgressComponent;
    let fixture: ComponentFixture<ShipmentRecordStepProgressComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ShipmentRecordStepProgressComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ShipmentRecordStepProgressComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
