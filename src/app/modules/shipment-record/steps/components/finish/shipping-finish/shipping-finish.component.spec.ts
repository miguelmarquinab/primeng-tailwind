import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingFinishComponent } from './shipping-finish.component';

describe('ShippingFinishComponent', () => {
  let component: ShippingFinishComponent;
  let fixture: ComponentFixture<ShippingFinishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingFinishComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingFinishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
