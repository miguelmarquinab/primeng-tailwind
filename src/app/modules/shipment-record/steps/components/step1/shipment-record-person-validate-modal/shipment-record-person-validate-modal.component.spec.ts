import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordPersonValidateModalComponent } from './shipment-record-person-validate-modal.component';

describe('ShipmentRecordPersonValidateModalComponent', () => {
    let component: ShipmentRecordPersonValidateModalComponent;
    let fixture: ComponentFixture<ShipmentRecordPersonValidateModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ShipmentRecordPersonValidateModalComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ShipmentRecordPersonValidateModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
