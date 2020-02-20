import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private api_url = `${window["_env_"]["API_URL"]}/api`;

  public constructor(
    private http: HttpClient,
  ) { }

  public change(name: string, password?: string): Observable<void> {
    return this.http.post<void>(`${this.api_url}/profile`, { name: name, password: password });
  }
}
