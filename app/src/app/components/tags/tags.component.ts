import { Component, OnInit } from '@angular/core';
import { faTimes, faSearch, faSquare as fasSquare, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { faSquare as farSquare } from '@fortawesome/free-regular-svg-icons';
import { DocumentService } from 'src/app/services/document.service';
import { Document } from 'src/app/models/document';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.less']
})
export class TagsComponent implements OnInit {
  faTimes = faTimes
  faSearch = faSearch
  fasSquare = fasSquare
  farSquare = farSquare
  faSortUp = faSortUp
  faSortDown = faSortDown

  availableSortProperties: Array<any> = [{ value: 'title', text: 'Title' }, { value: 'subtitle', text: 'Subtitle' }]

  availableTags: Array<string> = new Array<string>();
  selectedTags: Array<string> = new Array<string>();
  documents: Array<Document> = new Array<Document>();
  query: string = '';
  queryTags: string = '';
  sortProperty: string = 'title';
  sortDirection: string = 'up';
  isLoading: boolean = false;

  constructor(
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tags = params.get('tags')
      if (tags) {
        this.selectedTags = tags.split(',')
      }
    })
    this.loadTags()
    this.loadDocuments()
    // TODO this is not good
    this.location.replaceState(this.createPath())
  }

  loadTags(): void {
    this.documentService.getTags().subscribe(tags => {
      this.availableTags = tags.sort((one, two) => { return one > two ? 1 : -1 });
    })
  }

  loadDocuments(): void {
    if (this.selectedTags.length >= 1) {
      this.isLoading = true;
      this.documentService.getDocumentsByTags(this.selectedTags).subscribe(docs => {
        this.isLoading = false;
        this.documents = docs;
        this.orderBy()
      },
        error => {
          this.isLoading = false;
        })
    } else {
      this.documents = [];
    }
  }

  toggleTag(event, tag: string): void {
    event.preventDefault();
    if (this.selectedTags.includes(tag)) {
      this.removeTag(tag)
    } else {
      this.addTag(tag)
    }
  }

  clearSelection() {
    this.selectedTags = [];
    this.documents = [];
    this.location.replaceState(this.createPath())
  }

  addTag(tag: string): void {
    this.selectedTags.push(tag)
    this.location.replaceState(this.createPath())
    this.loadDocuments()
  }

  removeTag(tag): void {
    const index = this.selectedTags.indexOf(tag)
    this.selectedTags.splice(index, 1)
    this.location.replaceState(this.createPath())
    this.loadDocuments()
  }

  orderBy(): void {
    this.documents = this.documents.sort((one, two) => {
      if (this.sortDirection === 'up') {
        return one[this.sortProperty] > two[this.sortProperty] ? 1 : -1;
      } else {
        return one[this.sortProperty] < two[this.sortProperty] ? 1 : -1;
      }
    })
  }

  public setDirection(value: string): void {
    this.sortDirection = value;
    this.orderBy();
  }

  open(doc): void {
    this.router.navigate(['document', doc._id])
  }

  private createPath(): string {
    const tags = this.selectedTags.join(',')
    const sTags = encodeURIComponent(tags)
    const path = `/tags;tags=${sTags}`;
    return path;
  }
}
