import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordStep1Component } from './shipment-record-step1.component';

describe('ShipmentRecordStep1Component', () => {
    let component: ShipmentRecordStep1Component;
    let fixture: ComponentFixture<ShipmentRecordStep1Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ShipmentRecordStep1Component]
        }).compileComponents();

        fixture = TestBed.createComponent(ShipmentRecordStep1Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
