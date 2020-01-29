import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { SiteService, sites } from 'src/app/services/site.service';
import { DocumentService } from 'src/app/services/document.service';

import { faHeart } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public faHeart = faHeart;

  public favorites: Array<any> = new Array<any>()

  public constructor(
    private router: Router,
    private notifyService: NotificationService,
    private siteService: SiteService,
    private documentService: DocumentService,
  ) {
    this.siteService.setState(sites.home);
  }

  public ngOnInit(): void {
    this.loadFavorites();
  }

  public loadFavorites(): void {
    this.documentService.getFavorites().subscribe(data => {
      this.favorites = data;
    },error => {
      this.notifyService.error(error, '');
    });
  }

  public openDocument(id): void {
    this.router.navigate(['document', id]);
  }

  public toggleFavorite(event, id): void {
    this.documentService.toggleFavorite(id).subscribe(() =>{
      this.loadFavorites();
    });
    event.stopPropagation();
  }
}
