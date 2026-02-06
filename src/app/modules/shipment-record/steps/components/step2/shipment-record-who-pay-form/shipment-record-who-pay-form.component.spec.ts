import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentRecordWhoPayFormComponent } from './shipment-record-who-pay-form.component';

describe('ShipmentRecordWhoPayFormComponent', () => {
  let component: ShipmentRecordWhoPayFormComponent;
  let fixture: ComponentFixture<ShipmentRecordWhoPayFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentRecordWhoPayFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordWhoPayFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
