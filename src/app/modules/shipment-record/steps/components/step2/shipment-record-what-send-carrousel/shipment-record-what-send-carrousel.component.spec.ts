import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordWhatSendCarrouselComponent } from './shipment-record-what-send-carrousel.component';

describe('ShipmentRecordWhatSendCarrouselComponent', () => {
  let component: ShipmentRecordWhatSendCarrouselComponent;
  let fixture: ComponentFixture<ShipmentRecordWhatSendCarrouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentRecordWhatSendCarrouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordWhatSendCarrouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
