import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordDestinationStoreComponent } from './shipment-record-destination-store.component';

describe('ShipmentRecordDestinationStoreComponent', () => {
  let component: ShipmentRecordDestinationStoreComponent;
  let fixture: ComponentFixture<ShipmentRecordDestinationStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentRecordDestinationStoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordDestinationStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
