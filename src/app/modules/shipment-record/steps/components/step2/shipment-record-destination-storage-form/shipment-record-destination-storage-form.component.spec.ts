import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ShipmentRecordDestinationStorageFormComponent } from './shipment-record-destination-storage-form.component';

class TranslateLoaderStub implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('ShipmentRecordDestinationStorageFormComponent', () => {
  let component: ShipmentRecordDestinationStorageFormComponent;
  let fixture: ComponentFixture<ShipmentRecordDestinationStorageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ShipmentRecordDestinationStorageFormComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderStub
          }
        })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentRecordDestinationStorageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
