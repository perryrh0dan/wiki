import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesCreateComponent } from './files-create.component';

describe('FilesCreateComponent', () => {
  let component: FilesCreateComponent;
  let fixture: ComponentFixture<FilesCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
