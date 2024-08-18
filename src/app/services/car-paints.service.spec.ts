import { TestBed } from '@angular/core/testing';

import { CarPaintsService } from './car-paints.service';

describe('CarPaintsService', () => {
  let service: CarPaintsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarPaintsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
