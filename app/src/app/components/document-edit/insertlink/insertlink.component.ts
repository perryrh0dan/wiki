import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'insert-link',
  templateUrl: './insertlink.component.html',
  styleUrls: ['./insertlink.component.scss'],
})
export class InsertLinkComponent {
  public externalUrl: string = ''
  public internalPath: string = ''

  public constructor(
    public dialogRef: MatDialogRef<InsertLinkComponent>,
  ) { }

  public insert(): void {
    this.dialogRef.close({ url: '[](/document/)' });
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
