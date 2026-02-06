import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordWhatSendComponent } from './shipment-record-what-send.component';

describe('ShipmentRecordWhatSendComponent', () => {
  let component: ShipmentRecordWhatSendComponent;
  let fixture: ComponentFixture<ShipmentRecordWhatSendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentRecordWhatSendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordWhatSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
