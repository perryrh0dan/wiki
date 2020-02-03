import { Component, Inject } from '@angular/core';
import { UploadService } from 'src/app/services/upload.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ThemeService } from 'src/app/services/theme.service';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'files-create',
  templateUrl: './files-create.component.html',
  styleUrls: ['./files-create.component.scss'],
})
export class FilesCreateComponent {
  public name = ''

  public constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FilesCreateComponent>,
    private uploadService: UploadService,
    private loadingService: LoadingService,
    private notifySerivce: NotificationService,
    private overlayContainer: OverlayContainer,
    private themeService: ThemeService,
  ) {
    this.themeService.isDarkTheme.subscribe((x: boolean) => {
      this.setTheme(x ? 'dark-theme' : 'default-theme');
    });
  }

  private setTheme(theme: string = 'default-theme'): void {
    this.overlayContainer.getContainerElement().classList.add(theme);
  }

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
