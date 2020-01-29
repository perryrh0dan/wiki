import { Component, OnInit } from '@angular/core';
import { SiteService } from 'src/app/services/site.service';
import { sites } from 'src/app/services/site.service';
import { AdminService } from 'src/app/services/admin.service';
import { NotificationService } from 'src/app/services/notification.service';

import { faSignal } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.less'],
})
export class StatisticsComponent implements OnInit {
  faSignal = faSignal

  stats: any;
  results: any;

  //options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = false;
  showYAxisLabel = false;

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  }

  constructor(
    private siteService: SiteService,
    private adminService: AdminService,
    private notifyService: NotificationService,
  ) {
    this.siteService.setState(sites.settings);
  }

  ngOnInit() {
    this.adminService.getStatus().subscribe(
      stats => {
        this.stats = stats;
        this.results = [
          {
            "name": "Entries",
            "value": stats.entries.entries,
          },
          {
            "name": "Users",
            "value": stats.users.users,
          },
        ];
      },
      error => {
        this.notifyService.error(error, '');
      },
    );
  }

  onSelect(event) {
    // console.log(event)
  }

}
