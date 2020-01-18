import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.less']
})
export class DocumentListComponent implements OnInit {
  @Input() documents;

  constructor() { }

  ngOnInit() {
  }
}
