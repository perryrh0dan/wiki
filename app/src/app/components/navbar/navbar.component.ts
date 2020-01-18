import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { DocumentService } from '../../services/document.service'
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
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less']
})
export class NavBarComponent implements OnInit, OnDestroy {
  faPlus = faPlus;
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;
  faSave = faSave;
  faTimes = faTimes;
  faAngleDoubleRight = faAngleDoubleRight;

  _stateSubscription: Subscription
  _documentSubscription: Subscription
  _loadingSubscription: Subscription
  state: sites
  sitesStatus: typeof sites = sites
  query: String = ''
  searchresults: Array<any> = new Array<any>();
  wasInside: Boolean = false
  document: Document
  loading: Boolean
  selectedSearchResult: number = -1;

  constructor(
    public router: Router,
    private documentService: DocumentService,
    private dialog: MatDialog,
    private notifyService: NotificationService,
    private loadingService: LoadingService,
    private siteService: SiteService,
    private sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    this._stateSubscription = this.siteService.state.subscribe(x => this.state = x)
    this._documentSubscription = this.documentService.document.subscribe(x => this.document = x)
    this._loadingSubscription = this.loadingService.loading.subscribe(x => this.loading = x)
  }

  ngOnDestroy(): void {
    this._stateSubscription.unsubscribe()
    this._documentSubscription.unsubscribe()
    this._loadingSubscription.unsubscribe()
  }

  @HostListener('keydown', ['$event'])
  public onKeyDown(e) {
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
      const searchResult = this.searchresults[this.selectedSearchResult]
      if (searchResult) {
        this.open(searchResult.id)
      }
    }
  }

  search(): void {
    // close sidebar when start typing
    this.sidebarService.closeSidebar();
    if (this.query.length <= 2) {
      this.searchresults = []
    } else {
      this.documentService.search(this.query).subscribe(x => {
        if (this.query.length <= 2) return
        this.searchresults = x.results
      })
    }
  }

  create(option): void {
    // close sidebar when clicking on create
    this.sidebarService.closeSidebar();
    let dialogConfig = new MatDialogConfig()
    dialogConfig.autoFocus = true
    // dialogConfig.width = '50%'
    switch (option) {
      case 'document':
        let path = this.document._id ? this.document._id + '/' : ''
        dialogConfig.data = { path: path }
        this.dialog.open(DocumentCreateComponent, dialogConfig)
        break;
      case 'user':
        this.dialog.open(UserCreateComponent, dialogConfig)
        break;
      case 'role':
        this.dialog.open(RoleCreateComponent, dialogConfig)
        break;
      case 'directory':
        this.dialog.open(FilesCreateComponent, dialogConfig)
        break;
    }
  }

  save(): void {
    // close sidebar when clicking on save
    this.sidebarService.closeSidebar();
    this.loadingService.start()
    this.documentService.editDocument().subscribe(() => {
      this.router.navigate(['document', this.document._id])
      this.loadingService.stop()
      this.notifyService.success('Saved successfull', '')
    }, error => {
      this.loadingService.stop()
      this.notifyService.error(error, '')
    })
  }

  open(path): void {
    // close sidebar when clicking on open
    this.sidebarService.closeSidebar();
    this.selectedSearchResult = -1;
    this.router.navigate(['document', path])
    this.resetSearch()
    this.sidebarService.closeSidebar();
  }

  resetSearch(): void {
    this.searchresults = []
    this.query = ''
  }

  cancel(): void {
    // close sidebar when clicking on cancel
    this.sidebarService.closeSidebar();
    // obsolet we are reloading in document component
    // this.documentService.reloadDocument()
    this.router.navigate(['document', this.document._id])
  }

  edit(): void {
    this.router.navigate(['edit/document', this.document._id])
  }

  delete(): void {
    // close sidebar when clicking on delete
    this.sidebarService.closeSidebar();
    let dialogConfig = new MatDialogConfig()
    dialogConfig.autoFocus = true
    // dialogConfig.width = '40%'
    dialogConfig.data = { title: "Delete Document", message: 'Do you confirm the deletion of this document?' }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingService.start()
        this.documentService.deleteDocument().subscribe(
          () => {
            this.loadingService.stop()
            this.router.navigate(['home'])
          },
          error => {
            this.loadingService.stop()
            this.notifyService.error("Something went wrong", "")
          }
        )
      }
    })
  }

  move(): void {
    // close sidebar when clicking on move
    this.sidebarService.closeSidebar();
    let dialogConfig = new MatDialogConfig()
    dialogConfig.autoFocus = true
    // dialogConfig.width = '50%'
    let path = this.document._id ? this.document._id + '/' : ''
    dialogConfig.data = { path: path }
    this.dialog.open(DocumentMoveComponent, dialogConfig)
  }

  home(): void {
    // close sidebar when clicking on home
    this.sidebarService.closeSidebar();
    this.router.navigate(['home'])
  }

  @HostListener('click')
  clickInside() {
    this.wasInside = true;
  }

  @HostListener('document:click')
  clickout() {
    if (!this.wasInside) {
      this.resetSearch()
    }
    this.wasInside = false
  }
}
