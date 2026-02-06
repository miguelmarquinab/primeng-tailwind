import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordDestinationCardComponent } from './shipment-record-destination-card.component';

describe('ShipmentRecordDestinationCardComponent', () => {
  let component: ShipmentRecordDestinationCardComponent;
  let fixture: ComponentFixture<ShipmentRecordDestinationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentRecordDestinationCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordDestinationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
