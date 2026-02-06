import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ShipmentRecordStep2Component } from './shipment-record-step2.component';

class TranslateLoaderStub implements TranslateLoader {
    getTranslation() {
        return of({});
    }
}

describe('ShipmentRecordStep2Component', () => {
    let component: ShipmentRecordStep2Component;
    let fixture: ComponentFixture<ShipmentRecordStep2Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ShipmentRecordStep2Component,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateLoaderStub
                    }
                })
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ShipmentRecordStep2Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
