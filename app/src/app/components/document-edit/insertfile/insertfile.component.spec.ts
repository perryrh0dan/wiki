import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertFileComponent } from './insertfile.component';

describe('InsertfileComponent', () => {
  let component: InsertFileComponent;
  let fixture: ComponentFixture<InsertFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertFileComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
