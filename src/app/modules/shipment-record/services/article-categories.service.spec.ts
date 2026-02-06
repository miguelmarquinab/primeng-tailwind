import { TestBed } from '@angular/core/testing';

import { ArticleCategoriesService } from './article-categories.service';

describe('ArticleCategoriesService', () => {
  let service: ArticleCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticleCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
