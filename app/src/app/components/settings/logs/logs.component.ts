import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { SiteService, sites } from 'src/app/services/site.service';

import { faHardHat } from '@fortawesome/free-solid-svg-icons';

type TLog = {
  file: string
  display: string
}

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.less']
})
export class LogsComponent implements OnInit {
  faHardHat = faHardHat

  logs: Array<TLog> = new Array<TLog>();
  selectedLog: string;
  log: string = '';

  constructor(
    private adminService: AdminService,
    private siteService: SiteService,
  ) {
    this.siteService.setState(sites.settings)
  }

  ngOnInit() {
    this.adminService.getLogs().subscribe(logs => {
      logs.files.filter(file => {
        return file.endsWith('.json') === false
      }).map(file => {
        this.logs.push({ file: file, display: file.replace(/\.(.)*/, "") })
      });

      if (this.logs.length <= 0) return
      this.selectedLog = this.logs[this.logs.length - 1].file
      this.loadLog()
    })
  }

  public loadLog() {
    this.adminService.getLog(this.selectedLog).subscribe(log => {
      this.log = this.decodeUtf8(log).replace(new RegExp('\n', 'g'), "<br />")
    })
  }

  decodeUtf8(arrayBuffer: ArrayBuffer) {
    var result = "";
    var i = 0;
    var c = 0;
    var c2 = 0;

    var data = new Uint8Array(arrayBuffer);

    // If we have a BOM skip it
    if (data.length >= 3 && data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
      i = 3;
    }

    while (i < data.length) {
      c = data[i];

      if (c < 128) {
        result += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        if (i + 1 >= data.length) {
          throw "UTF-8 Decode failed. Two byte character was truncated.";
        }
        c2 = data[i + 1];
        result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        if (i + 2 >= data.length) {
          throw "UTF-8 Decode failed. Multi byte character was truncated.";
        }
        c2 = data[i + 1];
        let c3 = data[i + 2];
        result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return result;
  }
}
