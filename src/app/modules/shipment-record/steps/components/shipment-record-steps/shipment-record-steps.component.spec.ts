import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordStepsComponent } from './shipment-record-steps.component';

describe('ShipmentRecordStepsComponent', () => {
    let component: ShipmentRecordStepsComponent;
    let fixture: ComponentFixture<ShipmentRecordStepsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ShipmentRecordStepsComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ShipmentRecordStepsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
