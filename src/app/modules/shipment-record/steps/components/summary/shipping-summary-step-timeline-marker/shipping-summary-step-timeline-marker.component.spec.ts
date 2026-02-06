import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingSummaryStepTimelineMarkerComponent } from './shipping-summary-step-timeline-marker.component';

describe('ShippingSummaryStepTimelineMarkerComponent', () => {
  let component: ShippingSummaryStepTimelineMarkerComponent;
  let fixture: ComponentFixture<ShippingSummaryStepTimelineMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingSummaryStepTimelineMarkerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingSummaryStepTimelineMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
