import { Component, OnInit } from '@angular/core';
import { UploadService } from 'src/app/services/upload.service';
import { MatDialogRef } from '@angular/material/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';

// Icons
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'insert-file',
  templateUrl: './insertfile.component.html',
  styleUrls: ['./insertfile.component.scss'],
})
export class InsertFileComponent implements OnInit {
  public faFolder = faFolder;

  private api_url = `${window["_env_"]["API_URL"]}/api`;

  public type = 'image'
  public folders: []
  public images: any[]
  public selectedFolder: any = '';
  private selectedFiles: Array<any> = new Array<any>();

  public constructor(
    public dialogRef: MatDialogRef<InsertFileComponent>,
    private uploadService: UploadService,
    private overlayContainer: OverlayContainer,
    private themeService: ThemeService,
  ) { 
    this.themeService.isDarkTheme.subscribe((x: boolean) => {
      this.setTheme(x ? 'dark-theme' : 'default-theme');
    });
  }

  private setTheme(theme: string = 'default-theme'): void {
    this.overlayContainer.getContainerElement().classList.add(theme);
  }

  public ngOnInit(): void {
    this.uploadService.loadFolders().subscribe(folders => {
      this.folders = folders;
    });
    if (this.type === 'image') {
      this.openFolder('');
    } else if (this.type === 'file') {
      //load files
    }
  }

  public openFolder(name: string): void {
    this.selectedFolder = name;
    this.uploadService.loadImages(name).subscribe(images => {
      this.images = images;
      this.images.forEach(image => {
        image.thumbnailurl = this.api_url + '/uploads/t/' + image._id + '.png';
      });
    });
  }

  public select(file: any): void {
    if (this.checkSelectedFile(file)) {
      const index = this.selectedFiles.indexOf(file);
      this.selectedFiles.splice(index, 1);
    } else {
      this.selectedFiles.push(file);
    }
  }

  public add(): void {
    const urls = Array<any>();
    this.selectedFiles.forEach(file => {
      const url = this.buildFileUrl(file);
      urls.push(url);
    });
    this.dialogRef.close({ urls: urls });
  }

  private buildFileUrl(file: any): string {
    const folder = file.folder !== 'f:' ? file.folder.substring(2, file.folder.length) + '/' : '';
    const url = this.api_url + '/uploads/' + folder + file.filename;
    const markdown = `![${file.filename}](${url}) "${file.filename}"`;
    return markdown;
  }

  public checkSelectedFile(file: any): boolean {
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
