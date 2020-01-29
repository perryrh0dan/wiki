import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { SiteService, sites } from 'src/app/services/site.service';
import { DocumentService } from 'src/app/services/document.service';

import { faHeart } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {
  faHeart = faHeart

  favorites: Array<any> = new Array<any>()

  constructor(
    private router: Router,
    private notifyService: NotificationService,
    private siteService: SiteService,
    private documentService: DocumentService,
  ) { 
    this.siteService.setState(sites.home);
  }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.documentService.getFavorites().subscribe(data => {
      this.favorites = data;
    },error => {
      this.notifyService.error(error, '');
    });
  }

  openDocument(id) {
    this.router.navigate(['document', id]);
  }

  toggleFavorite(event, id) {
    this.documentService.toggleFavorite(id).subscribe(() =>{
      this.loadFavorites();
    });
    event.stopPropagation();
  }
}
