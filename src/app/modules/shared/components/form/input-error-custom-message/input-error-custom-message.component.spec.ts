import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputErrorCustomMessageComponent } from './input-error-custom-message.component';

describe('InputErrorCustomMessageComponent', () => {
  let component: InputErrorCustomMessageComponent;
  let fixture: ComponentFixture<InputErrorCustomMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputErrorCustomMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputErrorCustomMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
