import { TestBed } from '@angular/core/testing';

import { HabilidadeService } from './habilidade.service';

describe('HabilidadeService', () => {
  let service: HabilidadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabilidadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
