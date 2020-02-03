import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { APP_CONFIG, AppConfig } from '../app-config.module';

@Injectable({
    providedIn: "root",
})
export class ProfileService {

    constructor(
        @Inject(APP_CONFIG) private config: AppConfig,
        private http: HttpClient,
    ) { }

    get() {

    }

    change(name, password?) {
        return this.http.post(`${this.config.apiEndpoint}/profile`, { name: name, password: password });
    }

    loadSettings() {
      return this.http.get(`${this.config.apiEndpoint}/profile/settings`);
    }

    updateSettings(settings: any, key: string, value: any) {
      settings[key] = value;
      return this.http.post(`${this.config.apiEndpoint}/profile/settings`, settings);
    }
}
