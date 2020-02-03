import { Component, Inject, OnInit } from '@angular/core';
import { DocumentService } from 'src/app/services/document.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ThemeService } from 'src/app/services/theme.service';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'document-create',
  templateUrl: './document-create.component.html',
  styleUrls: ['./document-create.component.scss'],
})
export class DocumentCreateComponent implements OnInit {
  public path = ''
  public templates: []
  public selectedTemplate: string

  public constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DocumentCreateComponent>,
    private documentService: DocumentService,
    private router: Router,
    private loadingService: LoadingService,
    private notifySerivce: NotificationService,
    private overlayContainer: OverlayContainer,
    private themeService: ThemeService,
  ) {
    this.path = this.data.path;
    this.themeService.isDarkTheme.subscribe((x: boolean) => {
      this.setTheme(x ? 'dark-theme' : 'default-theme');
    });
  }

  private setTheme(theme: string = 'default-theme'): void {
    this.overlayContainer.getContainerElement().classList.add(theme);
  }

  public ngOnInit(): void {
    this.documentService.getTemplates().subscribe(templates => {
      this.templates = templates.templates;
    });
  }

  public create(): void {
    this.loadingService.start();
    this.documentService.createDocument(this.path, this.selectedTemplate).subscribe(res => {
      this.dialogRef.close();
      this.loadingService.stop();
      this.router.navigate(['edit/document/', this.path]);
    }, error => {
      this.notifySerivce.error(error, '');
      this.loadingService.stop();
    });
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
