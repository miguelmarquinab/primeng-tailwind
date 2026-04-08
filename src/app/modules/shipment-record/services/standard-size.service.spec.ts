import { TestBed } from '@angular/core/testing';

import { StandardSizeService } from './standard-size.service';

describe('StandardSizeService', () => {
  let service: StandardSizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandardSizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
