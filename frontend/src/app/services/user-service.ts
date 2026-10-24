import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Destination
  userURL: string = 'http://localhost:5000/users';
  loginURL: string = 'http://localhost:5000/login';

  // Delivery person
  private httpClient = inject(HttpClient);

  // Response: to fetch users.
  getAllUsers() {
    return this.httpClient.get(this.userURL);
  }

  addUser(userObj: any) {
    return this.httpClient.post(this.userURL, userObj);
  }

  getUserById(id: string) {
    return this.httpClient.get(`${this.userURL}/${id}`);
  }

  deleteUserById(id: string) {
    return this.httpClient.delete(`${this.userURL}/${id}`);
  }

  updateUser(userObj: any) {
    return this.httpClient.put(this.userURL, userObj);
  }

  logIn(loginData: {email: string, pwd: string}): Observable<any> {
    return this.httpClient.post<any>(this.loginURL, loginData);
  }

  
  
  // // If using real back-end: POST request + encypted data:
  // // URL's must be different from one another hence the '/login'.
  // logInUser(loginData: {email: string, pwd: string}): Observable<any>
  // {
  //   return this.httpClient.post<any[]>(this.userURL + '/login', loginData);
  // }


}