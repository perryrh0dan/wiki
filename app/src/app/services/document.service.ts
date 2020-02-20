import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Document } from '../models/document';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private api_url = window["_env_"]["API_URL"];
  private documentSubject: BehaviorSubject<Document>;
  public document: Observable<Document>;

  constructor(
    private http: HttpClient,
  ) {
    this.documentSubject = new BehaviorSubject<Document>(new Document());
    this.document = this.documentSubject.asObservable();
  }

  loadDocument(id, affectViews = true) {
    return this.http.post<Document>(`${this.api_url}/documents/get`, {
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
    this.http.post<Document>(`${this.api_url}/documents/get`, {
      id: this.documentSubject.getValue()._id,
      affectViews: false,
    }).subscribe(doc => {
      this.documentSubject.next(doc);
    });
  }

  createDocument(id: string, template?: string) {
    return this.http.put<any>(`${this.api_url}/documents/create/`, { id, template });
  }

  search(query) {
    return this.http.get<any>(`${this.api_url}/documents/search/${query}`);
  }

  editDocument() {
    return this.http.post(`${this.api_url}/documents/edit/`, { id: this.documentSubject.getValue()._id, content: this.documentSubject.getValue().content });
  }

  deleteDocument() {
    return this.http.delete(`${this.api_url}/documents/${this.documentSubject.getValue()._id}`).pipe(map(() => {
      this.documentSubject.next(new Document());
    }));
  }

  moveDocument(newpath) {
    return this.http.put(`${this.api_url}/documents/${this.documentSubject.getValue()._id}`, { newpath });
  }

  clearDocument() {
    this.documentSubject.next(new Document());
  }

  getAllFromPath(path) {
    return this.http.post<[]>(`${this.api_url}/documents/all`, { path });
  }

  getFavorites() {
    return this.http.get<any>(`${this.api_url}/documents/favorites`);
  }

  toggleFavorite(id) {
    return this.http.post<[]>(`${this.api_url}/documents/favorites/`, { id });
  }

  getTemplates() {
    return this.http.get<any>(`${this.api_url}/documents/templates/`);
  }

  getTags() {
    return this.http.get<[]>(`${this.api_url}/documents/tags/`);
  }

  getDocumentsByTags(tags: Array<string>) {
    return this.http.get<Document[]>(`${this.api_url}/documents/tags/${encodeURIComponent(tags.join(','))}`);
  }
}
