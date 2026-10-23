import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FavouriteService } from '../../services/favourite-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  private router = inject(Router);
  public cartService = inject(FavouriteService);
  menuIsVisible = false;
  buttonIsActive = false;


  getConnectedUser() {
    const user = JSON.parse(localStorage.getItem('connectedUser') || 'null');
    return user
  }

  logOut() {
    localStorage.removeItem('connectedUser');
    this.router.navigate(['/log-in']);
  }

  toggleHambugerMenu() {
    this.menuIsVisible === true ? this.menuIsVisible = false : this.menuIsVisible = true;
    this.buttonIsActive === true ? this.buttonIsActive = false : this.buttonIsActive = true;
  }

}

