import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentService } from 'src/app/services/document.service';
import { Router } from '@angular/router';

import { DocumentCreateComponent } from '../document-create/document-create.component';
import { LoadingService } from 'src/app/services/loading.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-document-move',
  templateUrl: './document-move.component.html',
  styleUrls: ['./document-move.component.less']
})
export class DocumentMoveComponent {
  newpath = ''

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DocumentCreateComponent>,
    private documentService: DocumentService,
    private router: Router,
    private loadingService: LoadingService,
    private notifyService: NotificationService
  ) { 
    this.newpath = this.data.path
  }

  move() {
    this.loadingService.start()
    this.documentService.moveDocument(this.newpath).subscribe(
      res => {
        this.dialogRef.close();
        this.router.navigate(['document/', this.newpath]);
        this.loadingService.stop();
        this.notifyService.success('Document moved successfull', '');
      },
      error => {
        this.loadingService.stop();
        this.notifyService.error(error, '');
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
