import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ContactService {

  contactURL: string = 'http://localhost:5000/contact'
  private httpClient = inject(HttpClient);

  saveMessage(messageObj: any) {
    return this.httpClient.post(`${this.contactURL}`, messageObj);
  }

}

