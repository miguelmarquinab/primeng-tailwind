import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingSummaryStepOriginComponent } from './shipping-summary-step-origin.component';

describe('ShippingSummaryStepOriginComponent', () => {
  let component: ShippingSummaryStepOriginComponent;
  let fixture: ComponentFixture<ShippingSummaryStepOriginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingSummaryStepOriginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingSummaryStepOriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
