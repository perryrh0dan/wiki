import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { APP_CONFIG, AppConfig } from '../app-config.module';
import { Document } from '../models/document';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documentSubject: BehaviorSubject<Document>;
  public document: Observable<Document>;

  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private http: HttpClient
  ) {
    this.documentSubject = new BehaviorSubject<Document>(new Document());
    this.document = this.documentSubject.asObservable();
  }

  loadDocument(id, affectViews = true) {
    return this.http.post<Document>(`${this.config.apiEndpoint}/documents/get`, {
      id,
      affectViews,
    }).pipe(map(
      doc => {
        this.documentSubject.next(doc);
      },
      error => {
        console.log(error);
      }));
  }

  reloadDocument() {
    this.http.post<Document>(`${this.config.apiEndpoint}/documents/get`, {
      id: this.documentSubject.getValue()._id,
      affectViews: false
    }).subscribe(doc => {
      this.documentSubject.next(doc);
    });
  }

  createDocument(id: string, template?: string) {
    return this.http.put<any>(`${this.config.apiEndpoint}/documents/create/`, { id, template });
  }

  search(query) {
    return this.http.get<any>(`${this.config.apiEndpoint}/documents/search/${query}`);
  }

  editDocument() {
    return this.http.post(`${this.config.apiEndpoint}/documents/edit/`, { id: this.documentSubject.getValue()._id, content: this.documentSubject.getValue().content });
  }

  deleteDocument() {
    return this.http.delete(`${this.config.apiEndpoint}/documents/${this.documentSubject.getValue()._id}`).pipe(map(() => {
      this.documentSubject.next(new Document());
    }));
  }

  moveDocument(newpath) {
    return this.http.put(`${this.config.apiEndpoint}/documents/${this.documentSubject.getValue()._id}`, { newpath });
  }

  clearDocument() {
    this.documentSubject.next(new Document());
  }

  getAllFromPath(path) {
    return this.http.post<[]>(`${this.config.apiEndpoint}/documents/all`, { path });
  }

  getFavorites() {
    return this.http.get<any>(`${this.config.apiEndpoint}/documents/favorites`);
  }

  toggleFavorite(id) {
    return this.http.post<[]>(`${this.config.apiEndpoint}/documents/favorites/`, { id });
  }

  getTemplates() {
    return this.http.get<any>(`${this.config.apiEndpoint}/documents/templates/`);
  }

  getTags() {
    return this.http.get<[]>(`${this.config.apiEndpoint}/documents/tags/`);
  }

  getDocumentsByTags(tags: Array<string>) {
    return this.http.get<Document[]>(`${this.config.apiEndpoint}/documents/tags/${encodeURIComponent(tags.join(','))}`);
  }
}
