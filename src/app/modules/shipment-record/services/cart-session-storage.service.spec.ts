import { TestBed } from '@angular/core/testing';

import { CartSessionStorageService } from './cart-session-storage.service';

describe('CartSessionStorageService', () => {
    let service: CartSessionStorageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CartSessionStorageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
