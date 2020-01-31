import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { DocumentService } from '../../services/document.service';
import { Document } from 'src/app/models/document';
import { DocumentCreateComponent } from '../document-create/document-create.component';
import { RoleCreateComponent } from '../settings/role-create/role-create.component';
import { UserCreateComponent } from '../settings/user-create/user-create.component';
import { DocumentMoveComponent } from '../document-move/document-move.component';
import { NotificationService } from 'src/app/services/notification.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SiteService, sites } from 'src/app/services/site.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { FilesCreateComponent } from '../files-create/files-create.component';
import { SidebarService } from 'src/app/services/sidebar.service';

import { faPlus, faEdit, faSave, faTrashAlt, faTimes, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavBarComponent implements OnInit, OnDestroy {
  public faPlus = faPlus;
  public faEdit = faEdit;
  public faTrashAlt = faTrashAlt;
  public faSave = faSave;
  public faTimes = faTimes;
  public faAngleDoubleRight = faAngleDoubleRight;

  private stateSubscription: Subscription
  private documentSubscription: Subscription
  private loadingSubscription: Subscription
  public state: sites
  public sitesStatus: typeof sites = sites
  public query: string = ''
  public searchresults: Array<any> = new Array<any>();
  public wasInside: boolean = false
  public document: Document
  public loading: boolean
  public selectedSearchResult: number = -1;

  public constructor(
    public router: Router,
    private documentService: DocumentService,
    private dialog: MatDialog,
    private notifyService: NotificationService,
    private loadingService: LoadingService,
    private siteService: SiteService,
    private sidebarService: SidebarService,
  ) { }

  public ngOnInit(): void {
    this.stateSubscription = this.siteService.state.subscribe(x => this.state = x);
    this.documentSubscription = this.documentService.document.subscribe(x => this.document = x);
    this.loadingSubscription = this.loadingService.loading.subscribe(x => this.loading = x);
  }

  public ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
    this.documentSubscription.unsubscribe();
    this.loadingSubscription.unsubscribe();
  }

  @HostListener('keydown', ['$event'])
  public onKeyDown(e: any): void {
    switch (e.keyCode) {
      case 38: //arrow up
        this.arrowSelectResult(-1);
        break;
      case 40: //arrow down
        this.arrowSelectResult(1);
        break;
      case 13: //enter
        this.enterSelectResult();
    }
  }

  private arrowSelectResult(value: number): void {
    if (value > 0) {
      if (this.searchresults.length - 1 >= this.selectedSearchResult + value) {
        this.selectedSearchResult += value;
      }
    } else {
      if (this.selectedSearchResult + value >= 0) {
        this.selectedSearchResult += value;
      }
    }
  }

  private enterSelectResult(): void {
    if (this.searchresults.length > 0) {
      const searchResult = this.searchresults[this.selectedSearchResult];
      if (searchResult) {
        this.open(searchResult.id);
      }
    }
  }

  public search(): void {
    // close sidebar when start typing
    this.sidebarService.closeSidebar();
    if (this.query.length <= 2) {
      this.searchresults = [];
    } else {
      this.documentService.search(this.query).subscribe(x => {
        if (this.query.length <= 2) return;
        this.searchresults = x.results;
      });
    }
  }

  public create(option: string): void {
    // close sidebar when clicking on create
    this.sidebarService.closeSidebar();
    let dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    // dialogConfig.width = '50%'
    switch (option) {
      case 'document':
        let path = this.document._id ? this.document._id + '/' : '';
        dialogConfig.data = { path: path };
        this.dialog.open(DocumentCreateComponent, dialogConfig);
        break;
      case 'user':
        this.dialog.open(UserCreateComponent, dialogConfig);
        break;
      case 'role':
        this.dialog.open(RoleCreateComponent, dialogConfig);
        break;
      case 'directory':
        this.dialog.open(FilesCreateComponent, dialogConfig);
        break;
    }
  }

  public save(): void {
    // close sidebar when clicking on save
    this.sidebarService.closeSidebar();
    this.loadingService.start();
    this.documentService.editDocument().subscribe(() => {
      this.router.navigate(['document', this.document._id]);
      this.loadingService.stop();
      this.notifyService.success('Saved successfull', '');
    }, error => {
      this.loadingService.stop();
      this.notifyService.error(error, '');
    });
  }

  public open(path: string): void {
    // close sidebar when clicking on open
    this.sidebarService.closeSidebar();
    this.selectedSearchResult = -1;
    this.router.navigate(['document', path]);
    this.resetSearch();
    this.sidebarService.closeSidebar();
  }

  private resetSearch(): void {
    this.searchresults = [];
    this.query = '';
  }

  public cancel(): void {
    // close sidebar when clicking on cancel
    this.sidebarService.closeSidebar();
    // obsolet we are reloading in document component
    // this.documentService.reloadDocument()
    this.router.navigate(['document', this.document._id]);
  }

  public edit(): void {
    this.router.navigate(['edit/document', this.document._id]);
  }

  public delete(): void {
    // close sidebar when clicking on delete
    this.sidebarService.closeSidebar();
    let dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    // dialogConfig.width = '40%'
    dialogConfig.data = { title: "Delete Document", message: 'Do you confirm the deletion of this document?' };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingService.start();
        this.documentService.deleteDocument().subscribe(
          () => {
            this.loadingService.stop();
            this.router.navigate(['home']);
          },
          error => {
            this.loadingService.stop();
            this.notifyService.error("Something went wrong", "");
          },
        );
      }
    });
  }

  public move(): void {
    // close sidebar when clicking on move
    this.sidebarService.closeSidebar();
    let dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    // dialogConfig.width = '50%'
    let path = this.document._id ? this.document._id + '/' : '';
    dialogConfig.data = { path: path };
    this.dialog.open(DocumentMoveComponent, dialogConfig);
  }

  public home(): void {
    // close sidebar when clicking on home
    this.sidebarService.closeSidebar();
    this.router.navigate(['home']);
  }

  @HostListener('click')
  public clickInside(): void {
    this.wasInside = true;
  }

  @HostListener('document:click')
  public clickout(): void {
    if (!this.wasInside) {
      this.resetSearch();
    }
    this.wasInside = false;
  }
}
