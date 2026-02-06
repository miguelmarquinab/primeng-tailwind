import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordStep3Component } from './shipment-record-step3.component';

describe('ShipmentRecordStep3Component', () => {
    let component: ShipmentRecordStep3Component;
    let fixture: ComponentFixture<ShipmentRecordStep3Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ShipmentRecordStep3Component]
        }).compileComponents();

        fixture = TestBed.createComponent(ShipmentRecordStep3Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
