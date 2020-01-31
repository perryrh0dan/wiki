import { Component, Inject } from '@angular/core';
import { UploadService } from 'src/app/services/upload.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-files-create',
  templateUrl: './files-create.component.html',
  styleUrls: ['./files-create.component.less'],
})
export class FilesCreateComponent {
  public name = ''

  public constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FilesCreateComponent>,
    private uploadService: UploadService,
    private loadingService: LoadingService,
    private notifySerivce: NotificationService,
  ) { }

  public create(): void {
    this.loadingService.start();
    this.uploadService.createDirectory(this.name).subscribe(res => {
      this.dialogRef.close();
      this.loadingService.stop();
    }, error => {
      this.notifySerivce.error(error, '');
      this.loadingService.stop();
    });
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
