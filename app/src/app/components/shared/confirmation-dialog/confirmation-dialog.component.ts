import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ThemeService } from 'src/app/services/theme.service';
@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
  public constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
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

  public onNoClick(): void {
    this.dialogRef.close();
  }
}
