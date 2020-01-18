import { Component, Inject, OnInit } from '@angular/core';
import { DocumentService } from 'src/app/services/document.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-document-create',
  templateUrl: './document-create.component.html',
  styleUrls: ['./document-create.component.less']
})
export class DocumentCreateComponent implements OnInit {
  path = ''
  templates: []
  selectedTemplate: string

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DocumentCreateComponent>,
    private documentService: DocumentService,
    private router: Router,
    private loadingService: LoadingService,
    private notifySerivce: NotificationService
  ) { 
    this.path = this.data.path
  }

  ngOnInit() {
    this.documentService.getTemplates().subscribe(templates => {
      this.templates = templates.templates;
    })
  }

  create() {
    this.loadingService.start()
    this.documentService.createDocument(this.path, this.selectedTemplate).subscribe(res => {
      this.dialogRef.close()
      this.loadingService.stop()
      this.router.navigate(['edit/document/', this.path])
    }, error => {
      this.notifySerivce.error(error, '')
      this.loadingService.stop()
    })
  }

  cancel() {
    this.dialogRef.close()
  }
}
