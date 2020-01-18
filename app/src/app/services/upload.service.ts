import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { APP_CONFIG, AppConfig } from '../app-config.module';

@Injectable({
    providedIn: "root"
})
export class UploadService {
    folder: []

    constructor(
        @Inject(APP_CONFIG) private config: AppConfig,
        private http: HttpClient
    ) { }

    loadFolders() {
        return this.http.get<[]>(`${this.config.apiEndpoint}/uploads/folders`)
    }

    loadImages(folder) {
        return this.http.post<[]>(`${this.config.apiEndpoint}/uploads/images`, { folder: folder })
    }

    loadThumbnail(name) {
        return this.http.get(`${this.config.apiEndpoint}/uploads/t/${name}`, { responseType: 'blob' })
    }

    uploadImages(formData) {
        return this.http.post(`${this.config.apiEndpoint}/uploads/img`, formData, {
            reportProgress: true,
            observe: 'events'
        })
    }

    uploadFile(formData) {
        return this.http.post(`${this.config.apiEndpoint}/uploads/file`, formData, {
            reportProgress: true,
            observe: 'events'
        })
    }

    createDirectory(name) {
        return this.http.post(`${this.config.apiEndpoint}/uploads/folders`, { name: name })
    }

    deleteFile(id) {
        return this.http.delete(`${this.config.apiEndpoint}/uploads/${id}`)
    }
}
