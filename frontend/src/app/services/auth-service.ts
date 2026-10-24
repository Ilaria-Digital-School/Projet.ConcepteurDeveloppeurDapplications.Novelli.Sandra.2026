import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  connectedUser = signal<any>(null);

  logIn(user: any) {
    this.connectedUser.set(user);
  }

  logOut() {
    localStorage.removeItem('connectedUser');
    this.connectedUser.set(null);
  }

  getStoredUser() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('connectedUser');
      if (stored) {
        return JSON.parse(stored)
      }
      return null;
    }
    return null;
  }

  isAdmin() {
    return this.getStoredUser()?.role === 'admin';
  }

  
}


