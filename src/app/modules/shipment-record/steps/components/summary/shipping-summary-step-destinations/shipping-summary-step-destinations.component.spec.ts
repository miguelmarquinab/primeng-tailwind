import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingSummaryStepDestinationsComponent } from './shipping-summary-step-destinations.component';

describe('ShippingSummaryStepDestinationsComponent', () => {
  let component: ShippingSummaryStepDestinationsComponent;
  let fixture: ComponentFixture<ShippingSummaryStepDestinationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingSummaryStepDestinationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingSummaryStepDestinationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
