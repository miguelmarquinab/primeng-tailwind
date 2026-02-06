import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicLayoutHeaderComponent } from './public-layout-header.component';

describe('PublicLayoutHeaderComponent', () => {
    let component: PublicLayoutHeaderComponent;
    let fixture: ComponentFixture<PublicLayoutHeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PublicLayoutHeaderComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PublicLayoutHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
