import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { NotificationService } from 'src/app/services/notification.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SiteService, sites } from 'src/app/services/site.service';

import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
})
export class SystemComponent implements OnInit, OnDestroy {
  public faGlobe = faGlobe;

  private themeSubscription: Subscription;

  public info = {
    os: '',
    nodeversion: '',
    hostname: '',
    cpus: [],
    totalmem: '',
    cwd: '',
  };
  public backup: any;
  public liveinfo: any;
  public isDarkTheme: boolean;

  constructor(
    private adminService: AdminService,
    private notifyService: NotificationService,
    private loadingService: LoadingService,
    private siteService: SiteService,
    private router: Router,
    private authService: AuthenticationService,
    private themeService: ThemeService,
  ) {
    this.siteService.setState(sites.settings);
  }

  ngOnInit() {
    this.loadInfo();
    this.themeSubscription = this.themeService.isDarkTheme.subscribe(x => this.isDarkTheme = x);
  }

  ngOnDestroy() {
    this.themeSubscription.unsubscribe();
  }

  closeAllSessions() {
    this.adminService.closeAllSessions().subscribe(() => {
      this.notifyService.success('Successfull closed all sessions', '');
      this.authService.logout(true);
      this.router.navigate(['login']);
    });
  }

  loadInfo() {
    this.adminService.getSystemInfo().subscribe(data => {
      this.info = data.hostinfo;
      this.liveinfo = data.liveinfo;
      this.backup = data.backup;
    });
  }

  createBackup() {
    this.loadingService.start();
    this.adminService.backup().subscribe(() => {
      this.notifyService.success('Git Backup was successfull', '');
      this.loadInfo();
      this.loadingService.stop();
    }, error => {
      this.notifyService.error(error, '');
      this.loadInfo();
      this.loadingService.stop();
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
