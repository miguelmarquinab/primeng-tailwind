import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordOriginFormComponent } from './shipment-record-origin-form.component';

describe('ShipmentRecordOriginFormComponent', () => {
    let component: ShipmentRecordOriginFormComponent;
    let fixture: ComponentFixture<ShipmentRecordOriginFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ShipmentRecordOriginFormComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ShipmentRecordOriginFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
