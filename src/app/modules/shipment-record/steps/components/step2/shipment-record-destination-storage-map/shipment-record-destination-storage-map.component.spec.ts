import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordDestinationStorageMapComponent } from './shipment-record-destination-storage-map.component';

describe('ShipmentRecordDestinationStorageMapComponent', () => {
  let component: ShipmentRecordDestinationStorageMapComponent;
  let fixture: ComponentFixture<ShipmentRecordDestinationStorageMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentRecordDestinationStorageMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordDestinationStorageMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
