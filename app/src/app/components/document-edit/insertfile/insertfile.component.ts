import { Component, OnInit, Inject } from '@angular/core';
import { UploadService } from 'src/app/services/upload.service';
import { AppConfig, APP_CONFIG } from 'src/app/app-config.module';
import { MatDialogRef } from '@angular/material/dialog';

import { faFolder } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-insertfile',
  templateUrl: './insertfile.component.html',
  styleUrls: ['./insertfile.component.less'],
})
export class InsertFileComponent implements OnInit {
  faFolder = faFolder;

  type = 'image'
  folders: []
  images: any[]
  selectedFolder: any = '';
  selectedFiles: Array<any> = new Array<any>();

  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    public dialogRef: MatDialogRef<InsertFileComponent>,
    private uploadService: UploadService,
  ) { }

  ngOnInit() {
    this.uploadService.loadFolders().subscribe(folders => {
      this.folders = folders;
    });
    if (this.type === 'image') {
      this.openFolder('');
    } else if (this.type === 'file') {
      //load files
    }
  }

  openFolder(name) {
    this.selectedFolder = name;
    this.uploadService.loadImages(name).subscribe(images => {
      this.images = images;
      this.images.forEach(image => {
        image.thumbnailurl = this.config.apiEndpoint + '/uploads/t/' + image._id + '.png';
      });
    });
  }

  select(file) {
    if (this.checkSelectedFile(file)) {
      const index = this.selectedFiles.indexOf(file);
      this.selectedFiles.splice(index, 1);
    } else {
      this.selectedFiles.push(file);
    }
  }

  add() {
    const urls = Array<any>();
    this.selectedFiles.forEach(file => {
      const url = this.buildFileUrl(file);
      urls.push(url);
    });
    this.dialogRef.close({ urls: urls });
  }

  buildFileUrl(file) {
    const folder = file.folder !== 'f:' ? file.folder.substring(2, file.folder.length) + '/' : '';
    const url = this.config.apiEndpoint + '/uploads/' + folder + file.filename;
    const markdown = `![${file.filename}](${url}) "${file.filename}"`;
    return markdown;
  }

  checkSelectedFile(file) {
    for (let i = 0; i < this.selectedFiles.length; i++) {
      if (file.filename === this.selectedFiles[i].filename && file.folder === this.selectedFiles[i].folder) {
        return true;
      };
    }
    return false;
  }

  cancel() {
    this.dialogRef.close();
  }
}
