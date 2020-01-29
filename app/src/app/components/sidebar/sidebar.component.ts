import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { DocumentService } from 'src/app/services/document.service';
import { Subscription } from 'rxjs';

import { Document } from '../../models/document';
import { SidebarService } from 'src/app/services/sidebar.service';
import { sites, SiteService } from 'src/app/services/site.service';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { trigger, transition, style, animate, state } from '@angular/animations';

import { faHome, faSitemap, faChevronLeft, faArchive, faUser, faCog, faSignOutAlt, faChevronUp, faChevronDown, faUsers, faChartArea, faLock, faGlobe, faArrowRight, faFolder, faTags, faHardHat, faCogs, faAdjust } from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('treeEnterAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-250px)' }),
        animate('150ms', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)' }),
        animate('150ms', style({ transform: 'translateX(-250px)' })),
      ]),
    ]),
    trigger('parentTreeEnterAnimation', [
      transition(':enter', [
        style({ width: '0px' }),
        animate('150ms', style({ width: '50px' })),
      ]),
      transition(':leave', [
        style({ width: '50px' }),
        animate('150ms', style({ width: '0px' })),
      ]),
    ]),
    trigger('sidebarEnterAnimation', [
      state('open', style({
        transform: 'translateX(0)',
        width: '250px',
      })),
      state('small', style({
        // transform: 'translateX(0)',
        width: '50px',
      })),
      state('closed', style({
        transform: 'translateX(-250px)',
        width: '0px',
      })),
      state('blocked', style({
        transform: 'translateX(-250px)',
        width: '0px',
      })),
      transition('void => open', animate(0)),
      transition('open => closed', animate('250ms')),
      transition('closed => open', animate('250ms')),
      transition('open => small', animate('150ms')),
      transition('small => open', animate('150ms')),
      transition('open => blocked', animate('0ms')),
      transition('blocked => open', animate('0ms')),
      transition('* => *', animate('250ms')),
    ]),
  ],
})
export class SidebarComponent implements OnInit, OnDestroy {
  public faHome = faHome;
  public faSitemap = faSitemap;
  public faChevronLeft = faChevronLeft;
  public faArchive = faArchive;
  public faUser = faUser;
  public faCog = faCog;
  public faSignOutAlt = faSignOutAlt;
  public faChevronUp = faChevronUp;
  public faChevronDown = faChevronDown;
  public faUsers = faUsers;
  public faChartArea = faChartArea;
  public faLock = faLock;
  public faGlobe = faGlobe;
  public faArrowRight = faArrowRight;
  public faFolder = faFolder;
  public faTags = faTags;
  public faHardHat = faHardHat;
  public faCogs = faCogs;
  public faAdjust = faAdjust;

  private stateSubscription: Subscription;
  private documentSubscription: Subscription;
  private blurVisibleSubscription: Subscription;
  private treeVisibleSubscription: Subscription;
  private sidebarStateSubscription: Subscription;

  state: sites;
  sitesStatus: typeof sites = sites;
  document: Document;
  showSubPages = true;
  blurVisible: boolean;
  treeVisible: boolean;
  sidebarState: string;

  tree = {
    parents: [],
    entries: [],
  };

  constructor(
    public authService: AuthenticationService,
    private router: Router,
    private documentService: DocumentService,
    private sidebarService: SidebarService,
    private siteService: SiteService,
    private themeService: ThemeService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.stateSubscription = this.siteService.state.subscribe(state => this.state = state);
    this.documentSubscription = this.documentService.document.subscribe(doc => this.document = doc);
    this.blurVisibleSubscription = this.sidebarService.blurVisible.subscribe(blur => this.blurVisible = blur);
    this.treeVisibleSubscription = this.sidebarService.treeVisible.subscribe(visible => {
      if (!visible) {
        this.resetTree();
      }
      this.treeVisible = visible;
    });
    this.sidebarStateSubscription = this.sidebarService.state.subscribe(state => this.sidebarState = state.toString());
  }

  ngOnDestroy() {
    this.stateSubscription.unsubscribe();
    this.documentSubscription.unsubscribe();
    this.blurVisibleSubscription.unsubscribe();
    this.treeVisibleSubscription.unsubscribe();
    this.sidebarStateSubscription.unsubscribe();
  }

  command(command) {
    this.router.navigate([command]);
    this.closeSidebar();
  }

  closeSidebar() {
    this.sidebarService.closeSidebar();
    this.resetTree();
  }

  toggleTree() {
    if (this.treeVisible) {
      this.sidebarService.closeTree();
      return this.resetTree();
    }
    this.sidebarService.openTree();
    this.documentService.getAllFromPath('').subscribe(
      data => {
        this.tree.entries = data;
      },
      error => {
        console.log(error);
      });
  }

  public resetTree() {
    this.tree = {
      parents: [],
      entries: [],
    };
  }

  public documentsnext(page): void {
    this.tree.entries = [];
    this.tree.parents.push(page);
    this.documentService.getAllFromPath(page._id).subscribe(
      data => {
        this.tree.entries = data;
      },
      error => {
        console.log(error);
      });
  }

  public documentsback(page): void {
    this.tree.entries = [];
    const index = this.tree.parents.indexOf(page);
    this.tree.parents.length = index;
    const newpage = this.tree.parents.length > 0 ? this.tree.parents[index - 1]._id : '';
    this.documentService.getAllFromPath(newpage).subscribe(
      data => {
        this.tree.entries = data;
      },
      error => {
        console.log(error);
      });
  }

  public actionTree(page: any): void {
    if (page.isDirectory) {
      this.documentsnext(page);
    } else {
      this.open(page._id);
    }
  }

  public open(id): void {
    this.router.navigate(['document', id]);
    this.closeSidebar();
  }

  public logout(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '40%';
    dialogConfig.data = { title: 'Logout', message: 'Are you sure you want to log out of wiki?' };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout().subscribe(() => {
          this.router.navigate(['login']);
        });
      }
    });
  }

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  public getSubPages(document: Document): Array<any> {
    if (document.children) {
      return document.children.filter((child: any) => child.isEntry );
    } else {
      return [];
    }
  }
}
