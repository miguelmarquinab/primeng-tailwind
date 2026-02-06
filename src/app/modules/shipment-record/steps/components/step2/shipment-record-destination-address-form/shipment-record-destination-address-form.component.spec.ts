import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ShipmentRecordDestinationAddressFormComponent } from './shipment-record-destination-address-form.component';

class TranslateLoaderStub implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('ShipmentRecordDestinationAddressFormComponent', () => {
  let component: ShipmentRecordDestinationAddressFormComponent;
  let fixture: ComponentFixture<ShipmentRecordDestinationAddressFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ShipmentRecordDestinationAddressFormComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderStub
          }
        })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordDestinationAddressFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
