import { PipeTransform, Pipe } from "@angular/core";

@Pipe({ name: 'searchDocuments' })
export class SearchDocumentsPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter(it => {
      if (it.title && it.title.toLowerCase().includes(searchText)) {
        return true
      } else if (it.subtitle && it.subtitle.toLowerCase().includes(searchText)) {
        return true
      } else {
        return false
      }
    });
  }
}

@Pipe({ name: 'searchStrings' })
export class SearchStringsPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter(it => {
      return it.toLowerCase().includes(searchText)
    })
  }
}
