import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingSummaryPaymentDeniedComponent } from './shipping-summary-payment-denied.component';

describe('ShippingSummaryPaymentDeniedComponent', () => {
  let component: ShippingSummaryPaymentDeniedComponent;
  let fixture: ComponentFixture<ShippingSummaryPaymentDeniedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingSummaryPaymentDeniedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingSummaryPaymentDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
