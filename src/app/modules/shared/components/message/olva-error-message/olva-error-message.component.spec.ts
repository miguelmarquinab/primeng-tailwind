import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OlvaErrorMessageComponent } from './olva-error-message.component';

describe('OlvaErrorMessageComponent', () => {
  let component: OlvaErrorMessageComponent;
  let fixture: ComponentFixture<OlvaErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OlvaErrorMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OlvaErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
