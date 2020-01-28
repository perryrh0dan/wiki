import { Component, OnInit, OnDestroy, HostListener, ViewEncapsulation } from '@angular/core';
import { DocumentService } from 'src/app/services/document.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { Document } from 'src/app/models/document';
import { NotificationService } from 'src/app/services/notification.service';
import { SiteService, sites } from 'src/app/services/site.service';

import { faHeart as fasHeart, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'

import { buttonEnterAnimation } from './../../animations/button.animation';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  animations: [
    buttonEnterAnimation
  ],
  //markdown style are not applied
  encapsulation: ViewEncapsulation.None
})
export class DocumentComponent implements OnInit, OnDestroy {
  faArrowUp = faArrowUp
  fasHeart = fasHeart
  farHeart = farHeart

  _documentSubscription: Subscription;
  document: Document;
  favIconEntered = false;
  scrollupVisible: Boolean = false;

  constructor(
    private documentService: DocumentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notifyService: NotificationService,
    private siteService: SiteService
  ) {
    this.siteService.setState(sites.view)
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.documentService.loadDocument(params.id).subscribe(
        () => { },
        error => {
          this.notifyService.error(error, '')
        }
      )
    })
    this._documentSubscription = this.documentService.document.subscribe(doc => {
      this.document = doc
    })
  }

  ngOnDestroy() {
    this._documentSubscription.unsubscribe()
    this.documentService.clearDocument()
  }

  onScroll(event) {
    if (event.target.scrollTop > 200) {
      this.scrollupVisible = true
    } else {
      this.scrollupVisible = false
    }
  }

  scrollUp() {
    const component = document.getElementsByClassName('document-component')[0]
    component.scrollTop = 0;
  }

  focusContent(id) {
    const component = document.getElementsByClassName('document-component')[0]
    //reason: fixed navbar with 50px height
    let topOfElement = document.getElementById(id).offsetTop - 50;
    component.scroll({ top: topOfElement });
  }

  toggleFavorite() {
    this.documentService.toggleFavorite(this.document._id).subscribe(() => {
      this.documentService.reloadDocument()
    })
  }

  openTag(tag) {
    this.router.navigate(['tags', {tags: tag}])
  }

  @HostListener('click', ['$event'])
  public onclick($event) {
    if ($event.target.tagName === 'A') {
      let originalpath = $event.target.getAttribute('href')
      let hostname = location.hostname
      if (originalpath.match("^https?://" + hostname)) {
        $event.preventDefault()
        let path = originalpath.split('/document/')[1] || false
        if (!path) return
        this.router.navigate(['document', path])

      } else {
        return
      }
    } else {
      return
    }
  }
}
