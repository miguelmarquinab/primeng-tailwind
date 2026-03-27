import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingFinishErrorComponent } from './shipping-finish-error.component';

describe('ShippingFinishErrorComponent', () => {
  let component: ShippingFinishErrorComponent;
  let fixture: ComponentFixture<ShippingFinishErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingFinishErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingFinishErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
