import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartItemCloneButtonComponent } from './cart-item-clone-button.component';

describe('CartItemCloneButtonComponent', () => {
  let component: CartItemCloneButtonComponent;
  let fixture: ComponentFixture<CartItemCloneButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartItemCloneButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartItemCloneButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
