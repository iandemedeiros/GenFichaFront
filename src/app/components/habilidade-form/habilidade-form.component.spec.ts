import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabilidadeFormComponent } from './habilidade-form.component';

describe('HabilidadeFormComponent', () => {
  let component: HabilidadeFormComponent;
  let fixture: ComponentFixture<HabilidadeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabilidadeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabilidadeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
