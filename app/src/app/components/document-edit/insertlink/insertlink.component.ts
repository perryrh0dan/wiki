import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-insertlink',
  templateUrl: './insertlink.component.html',
  styleUrls: ['./insertlink.component.less'],
})
export class InsertLinkComponent implements OnInit {
  externalUrl: string = ''
  internalPath: string = ''

  constructor(
    public dialogRef: MatDialogRef<InsertLinkComponent>,
  ) { }

  ngOnInit() {

  }

  insert() {
    this.dialogRef.close({ url: '[](/document/)' });
  }

  cancel() {
    this.dialogRef.close();
  }
}
