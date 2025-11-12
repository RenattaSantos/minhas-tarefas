import { TestBed } from '@angular/core/testing';

import { Tarefas } from './tarefas.service';

describe('Tarefas', () => {
  let service: Tarefas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tarefas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
