import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartItemDeleteButtonComponent } from './cart-item-delete-button.component';

describe('DeleteComponent', () => {
  let component: CartItemDeleteButtonComponent;
  let fixture: ComponentFixture<CartItemDeleteButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartItemDeleteButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartItemDeleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
