import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ShipmentRecordDestinationComponent } from './shipment-record-destination.component';

class TranslateLoaderStub implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('ShipmentRecordDestinationComponent', () => {
  let component: ShipmentRecordDestinationComponent;
  let fixture: ComponentFixture<ShipmentRecordDestinationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ShipmentRecordDestinationComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderStub
          }
        })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
