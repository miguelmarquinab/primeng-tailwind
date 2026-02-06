import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordDestinationMapComponent } from './shipment-record-destination-map.component';

describe('ShipmentRecordDestinationMapComponent', () => {
  let component: ShipmentRecordDestinationMapComponent;
  let fixture: ComponentFixture<ShipmentRecordDestinationMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentRecordDestinationMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordDestinationMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
