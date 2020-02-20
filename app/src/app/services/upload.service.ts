import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class UploadService {
  private api_url = window["_env_"]["API_URL"];

  constructor(
    private http: HttpClient,
  ) { }

  loadFolders() {
    return this.http.get<[]>(`${this.api_url}/uploads/folders`);
  }

  loadImages(folder) {
    return this.http.post<[]>(`${this.api_url}/uploads/images`, { folder: folder });
  }

  loadThumbnail(name) {
    return this.http.get(`${this.api_url}/uploads/t/${name}`, { responseType: 'blob' });
  }

  uploadImages(formData) {
    return this.http.post(`${this.api_url}/uploads/img`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  uploadFile(formData) {
    return this.http.post(`${this.api_url}/uploads/file`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  createDirectory(name) {
    return this.http.post(`${this.api_url}/uploads/folders`, { name: name });
  }

  deleteFile(id) {
    return this.http.delete(`${this.api_url}/uploads/${id}`);
  }
}
