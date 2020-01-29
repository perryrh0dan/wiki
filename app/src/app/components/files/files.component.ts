import { Component, OnInit, Inject, HostListener, OnDestroy } from '@angular/core';
import { HttpEventType } from '@angular/common/http';

import { APP_CONFIG, AppConfig } from '../../app-config.module';
import { UploadService } from 'src/app/services/upload.service';
import { SiteService, sites } from 'src/app/services/site.service';
import { Subscription } from 'rxjs';
import { Socket } from 'ngx-socket-io';

import { faFolder } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.less'],
})
export class FilesComponent implements OnInit, OnDestroy {
  faFolder = faFolder

  filesupdate = this.socket.fromEvent<Document>('fileuploaded');
  _foldersSubscription: Subscription

  fileData: File[] = null;
  dragAreaClass: string = 'dragarea';
  selectedFolder = ''
  selectedFile: any;
  images = [];
  folders = [];

  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private uploadService: UploadService,
    private siteService: SiteService,
    private socket: Socket,
  ) {
    this.siteService.setState(sites.files);
    this.filesupdate.subscribe(() => {
      this.loadImages(this.selectedFolder);
    });
  }

  ngOnInit() {
    this.loadImages('');
    this._foldersSubscription = this.uploadService.loadFolders().subscribe(data => {
      this.folders = data;
    }, error => {
      console.log(error);
    });
  }

  ngOnDestroy() {
    this._foldersSubscription.unsubscribe();
  }

  loadImages(folder) {
    this.uploadService.loadImages(folder).subscribe(data => {
      this.selectedFolder = folder;
      this.images = data;
      this.images.forEach(image => {
        image.thumbnailurl = this.config.apiEndpoint + '/uploads/t/' + image._id + '.png';
      });
    }, error => {
      console.log(error);
    });
  }

  selectFile(file) {
    this.selectedFile = file;
  }

  onFileChange(fileInput: any) {
    this.fileData = <File[]>fileInput.target.files;
    this.uploadImgage();
  }

  uploadImgage() {
    const formData = new FormData();
    formData.append('folder', this.selectedFolder);
    Array.from(this.fileData).forEach(data => {
      formData.append('imgfile', data);
    });
    this.uploadService.uploadImages(formData).subscribe(events => {
      if (events.type == HttpEventType.UploadProgress) {
        console.log('Upload progress: ', Math.round(events.loaded / events.total * 100) + '%');
      } else if (events.type === HttpEventType.Response) {
        console.log(events);
        this.fileData = new Array<File>();
      }
    });
  }

  uploadFile() {
    const formData = new FormData();
    Array.from(this.fileData).forEach(data => {
      formData.append('imgfile', data);
    });
    this.uploadService.uploadFile(formData).subscribe(events => {
      if (events.type == HttpEventType.UploadProgress) {
        console.log('Upload progress: ', Math.round(events.loaded / events.total * 100) + '%');
      } else if (events.type === HttpEventType.Response) {
        console.log(events);
      }
    });
  }

  deleteFile() {
    console.log(this.selectedFile);
    this.uploadService.deleteFile(this.selectedFile._id).subscribe(result => {
      this.loadImages(this.selectedFolder);
    });
  }

  checkSelectedFile(file) {
    if (!this.selectedFile) return false;
    if (file.filename === this.selectedFile.filename && file.folder === this.selectedFile.folder) return true;
    return false;
  }

  @HostListener('dragover', ['$event']) onDragOver(event) {
    this.dragAreaClass = "droparea";
    event.preventDefault();
  }

  @HostListener('dragenter', ['$event']) onDragEnter(event) {
    this.dragAreaClass = "droparea";
    event.preventDefault();
  }

  @HostListener('dragend', ['$event']) onDragEnd(event) {
    this.dragAreaClass = "dragarea";
    event.preventDefault();
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event) {
    this.dragAreaClass = "dragarea";
    event.preventDefault();
  }

  @HostListener('drop', ['$event']) onDrop(event) {
    this.dragAreaClass = "dragarea";
    event.preventDefault();
    event.stopPropagation();
    this.fileData = <File[]>event.dataTransfer.files;
    this.uploadImgage();
  }
}
