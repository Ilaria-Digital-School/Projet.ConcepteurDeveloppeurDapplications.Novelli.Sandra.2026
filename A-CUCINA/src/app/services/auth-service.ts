import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

    getConnectedUser() {
    const user = JSON.parse(localStorage.getItem('connectedUser') || 'null');
    return user; 
  }

  isAdmin() {
    return this.getConnectedUser()?.admin;
  }

}
