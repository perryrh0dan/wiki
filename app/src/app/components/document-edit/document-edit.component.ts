import { Component, OnInit, OnDestroy, HostListener, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { DocumentService } from 'src/app/services/document.service';
import { Document } from 'src/app/models/document';
import { NotificationService } from 'src/app/services/notification.service';
import { InsertFileComponent } from './insertfile/insertfile.component';
import { LoadingService } from 'src/app/services/loading.service';
import { delay } from 'rxjs/operators';
import { SiteService, sites } from 'src/app/services/site.service';

import { faBold, faItalic, faStrikethrough, faHeading, faQuoteLeft, faList, faListOl, faLink, faImage, faTable, faGripLines, faEye } from '@fortawesome/free-solid-svg-icons';
import { InsertLinkComponent } from './insertlink/insertlink.component';

@Component({
  selector: 'document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss'],
  //markdown style are not applied
  encapsulation: ViewEncapsulation.None,
})
export class DocumentEditComponent implements OnInit, OnDestroy {
  @ViewChild('editor', { static: true }) private editor: ElementRef;

  private documentSubscription: Subscription
  public document: Document
  public toolbar: Array<any>
  public preview = false
  public history: Array<string> = new Array<string>()

  public constructor(
    private documentService: DocumentService,
    private activatedRoute: ActivatedRoute,
    private notifyService: NotificationService,
    private dialog: MatDialog,
    private loadingService: LoadingService,
    private siteService: SiteService,
  ) {
    this.siteService.setState(sites.edit);
    this.toolbar = [{
      icon: faBold,
      name: 'bold',
      tooltip: 'Bold',
    },
    {
      icon: faItalic,
      name: 'italic',
      tooltip: 'Italic',
    },
    {
      icon: faStrikethrough,
      name: 'strikethrough',
      tooltip: 'Strikethrough',
    },
    {
      name: 'seperator',
    },
    {
      icon: faHeading,
      name: 'heading',
      tooltip: 'Heading',
    },
    {
      icon: faQuoteLeft,
      name: 'quote',
      tooltip: 'Quote',
    },
    {
      name: 'seperator',
    },
    {
      icon: faList,
      name: 'list',
      tooltip: 'Bullets',
    },
    {
      icon: faListOl,
      name: 'listol',
      tooltip: 'Numbering',
    },
    {
      name: 'seperator',
    },
    {
      icon: faLink,
      name: 'link',
      tooltip: 'Link',
    },
    {
      icon: faImage,
      name: 'image',
      tooltip: 'Image',
    },
    {
      icon: faTable,
      name: 'table',
      tooltip: 'Table',
    },
    {
      icon: faGripLines,
      name: 'horline',
      tooltip: 'Horizontal line',
    },
    {
      icon: faEye,
      name: 'preview',
      tooltip: 'Preview',
    }];
  }

  public ngOnInit(): void {
    this.activatedRoute.params.pipe(delay(0)).subscribe(params => {
      this.loadingService.start();
      this.documentService.loadDocument(params.id, false).subscribe(
        () => {
          this.loadingService.stop();
        },
        error => {
          this.loadingService.stop();
          this.notifyService.error('Document not found, redirecting to start page', '');
        },
      );
    });
    this.documentSubscription = this.documentService.document.subscribe(doc => {
      this.document = doc;
      if (!doc.content) return;
      this.editor.nativeElement.value = doc.content;
    });
  }

  public ngOnDestroy(): void {
    this.documentSubscription.unsubscribe();
    this.documentService.clearDocument();
  }

  public writeValue(value: string): void {
    this.editor.nativeElement.value = value;
  }

  public getValue(): string {
    return this.editor.nativeElement.value;
  }

  public onChange(): void {
    let value = this.getValue();
    this.document.content = value;
    this.updateHistory(value);
  }

  public updateHistory(value: string): void {
    this.history.push(value);
    if (this.history.length >= 100) {
      this.history.shift();
    }
  }

  public revertChange(): void {
    let value = this.history.pop();
    this.writeValue(value);
    this.document.content = value;
  }

  public action(event: Event, action: string): void {
    event.preventDefault();
    switch (action) {
      case 'bold':
        this.surround('**');
        break;
      case 'italic':
        this.surround('*');
        break;
      case 'strikethrough':
        this.surround('~~');
        break;
      case 'heading':
        this.insert('# ');
        break;
      case 'link':
        this.insertLink();
        break;
      case 'list':
        this.insert('- ');
        break;
      case 'listol':
        this.insert('1. ');
        break;
      case 'image':
        this.insertImage();
        break;
      case 'table':
        this.insert('|      |      |\n|----|----|\n|      |      |');
        break;
      case 'horline':
        this.insert('-----');
        break;
      case 'preview':
        this.preview = !this.preview;
      default:
        break;
    }
  }

  private insert(text: string): void {
    if (this.editor) {
      const start = this.editor.nativeElement.selectionStart;

      this.writeValue(this.getValue().slice(0, start) + text + this.getValue().slice(start));

      this.editor.nativeElement.selectionStart =
        this.editor.nativeElement.selectionEnd = start + text.length;

      this.onChange();
    }
  }

  private surround(text: string): void {
    if (this.editor) {
      const start = this.editor.nativeElement.selectionStart;
      const end = this.editor.nativeElement.selectionEnd;
      const textlength = text.length;

      this.writeValue(this.getValue().slice(0, start) + text + this.getValue().slice(start));
      this.writeValue(this.getValue().slice(0, end + textlength) + text + this.getValue().slice(end + textlength));

      // todo this is working but ugly
      this.editor.nativeElement.selectionStart =
        this.editor.nativeElement.selectionEnd = end + text.length * 2;

      this.onChange();
    }
  }

  private insertLink(): void {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    this.dialog.open(InsertLinkComponent, dialogConfig).afterClosed().subscribe(response => {
      this.insert(response.url);
    });
  }

  private insertImage(): void {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '70%';
    dialogConfig.height = '70%';
    this.dialog.open(InsertFileComponent, dialogConfig).afterClosed().subscribe(response => {
      if (response) {
        response.urls.forEach(url => {
          this.insert(url);
          this.insert('\n');
        });
      }
    });
  }

  private save(): void {
    this.loadingService.start();
    this.documentService.editDocument().subscribe(() => {
      this.loadingService.stop();
      this.notifyService.success('Saved successfull', '');
    });
  }

  // Editor key events
  public keyDownEditor(event: KeyboardEvent): void {
    const keyCode = event.keyCode || event.which;

    if (keyCode == 9) {
      event.preventDefault();
      this.insert('\t');
    }

    // Strg + b
    if (event.ctrlKey && event.keyCode == 66) {
      this.action(event, 'bold');
    }

    // Strg + i
    if (event.ctrlKey && event.keyCode == 73) {
      this.action(event, 'italic');
    }
  }

  // Keyevent for the whole route
  @HostListener('keydown', ['$event'])
  public onKeyDown(e: any): void {
    if (e.ctrlKey && e.keyCode == 83) {
      e.preventDefault();
      this.save();
    }
  }
}
