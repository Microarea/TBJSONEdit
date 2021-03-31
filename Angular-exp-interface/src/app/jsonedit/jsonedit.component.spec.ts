import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsoneditComponent } from './jsonedit.component';

describe('JsoneditComponent', () => {
  let component: JsoneditComponent;
  let fixture: ComponentFixture<JsoneditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JsoneditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JsoneditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
