import { Component, inject } from '@angular/core';
import { RecipeService } from '../../services/recipe-service';
import { Router, RouterLink } from '@angular/router';
import { FavouriteService } from '../../services/favourite-service';

@Component({
  selector: 'app-favourites',
  imports: [],
  templateUrl: './favourites.html',
  styleUrl: './favourites.css',
})
export class Favourites {

  private recipeService = inject(RecipeService);
  private router = inject(Router);
  public favouriteService = inject(FavouriteService);






  viewRecipeDetails(id: string) {
    this.router.navigate(['/recipe-details', id]);
  }

  addToFavourites(recipeObj: any) {
    this.favouriteService.addToFavourites(recipeObj);
  }

}
