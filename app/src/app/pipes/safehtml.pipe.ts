import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PipeTransform, Pipe } from "@angular/core";

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  public constructor(private sanitized: DomSanitizer) {}
  public transform(value: any): SafeHtml {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
