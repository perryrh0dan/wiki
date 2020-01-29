import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SiteService, sites } from 'src/app/services/site.service';

import { faCogs } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.less'],
})
export class DebugComponent implements OnInit {
  faCogs = faCogs

  info = {
    os: '',
    nodeversion: '',
    hostname: '',
    cpus: [],
    totalmem: '',
    cwd: '',
  }

  constructor(
    private notifyService: NotificationService,
    private loadingService: LoadingService,
    private siteService: SiteService,
  ) {
    this.siteService.setState(sites.settings);
  }

  ngOnInit() {
  }

  spinnertest() {
    let self = this;

    this.loadingService.start();
    setTimeout(function () {
      self.loadingService.stop();
    }, 3000);
  }

  notifytest() {
    this.notifyService.success('test', 'test');
  }
}
