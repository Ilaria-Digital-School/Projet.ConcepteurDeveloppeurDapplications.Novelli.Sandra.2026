import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ContactService {

  contactURL: string = 'http://localhost:5000/contact'
  private httpClient = inject(HttpClient);

  saveMessage(messageObj: any) {
    // For security purposes.
    const csrfToken = this.getCsrfToken();
    const headers = new HttpHeaders({
      'X-CSRFToken': csrfToken
    });

    return this.httpClient.post(`${this.contactURL}`, messageObj, { headers });
  }

  // For security purposes.
  private getCsrfToken(): string {
    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    return metaTag ? metaTag.content : '';
  }
}

