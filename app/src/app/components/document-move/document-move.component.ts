import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentService } from 'src/app/services/document.service';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';

import { DocumentCreateComponent } from '../document-create/document-create.component';
import { LoadingService } from 'src/app/services/loading.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'document-move',
  templateUrl: './document-move.component.html',
  styleUrls: ['./document-move.component.scss'],
})
export class DocumentMoveComponent {
  public newpath = ''

  public constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DocumentCreateComponent>,
    private documentService: DocumentService,
    private router: Router,
    private loadingService: LoadingService,
    private notifyService: NotificationService,
    private overlayContainer: OverlayContainer,
    private themeService: ThemeService,
  ) {
    this.newpath = this.data.path;
    this.themeService.isDarkTheme.subscribe((x: boolean) => {
      this.setTheme(x ? 'dark-theme' : 'default-theme');
    });
  }

  private setTheme(theme: string = 'default-theme'): void {
    this.overlayContainer.getContainerElement().classList.add(theme);
  }

  public move(): void {
    this.loadingService.start();
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
      });
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
