import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordDestinationAddressComponent } from './shipment-record-destination-address.component';

describe('ShipmentRecordDestinationAddressComponent', () => {
  let component: ShipmentRecordDestinationAddressComponent;
  let fixture: ComponentFixture<ShipmentRecordDestinationAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentRecordDestinationAddressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordDestinationAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
