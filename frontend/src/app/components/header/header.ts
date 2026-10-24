import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';


@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  private router = inject(Router);
  private authService = inject(AuthService);

  menuIsVisible = false;
  buttonIsActive = false;
  

  userOnline = this.authService.connectedUser;
  
  getConnectedUser() {
    return this.userOnline();
  }

  logOut() {
    this.authService.logOut();
    this.router.navigate(['/log-in']);
  }

  toggleHambugerMenu() {
    this.menuIsVisible === true ? this.menuIsVisible = false : this.menuIsVisible = true;
    this.buttonIsActive === true ? this.buttonIsActive = false : this.buttonIsActive = true;
  }

}

