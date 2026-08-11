import { Component, inject } from '@angular/core';
import { Recipes } from '../recipes/recipes';
import { RecipeService } from '../../services/recipe-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-favourites',
  imports: [],
  templateUrl: './favourites.html',
  styleUrl: './favourites.css',
})
export class Favourites {

  private recipeService = inject(RecipeService);
  private router = inject(Router);

  recipes: any[] = [];
  favouriteRecipes: any = {};

  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    // Subscribe method is mandatory to fetch data.
    this.recipeService.getAllRecipes().subscribe({
      next: (res: any) => {
        this.recipes = res;
        console.log(res);
        // For search function.
        this.favouriteRecipes = res;
        console.log(this.favouriteRecipes);

      },
      error: (err) => {
        console.log(err);
        alert('Failed to get recipe list');
      }
    });
  }

  viewRecipeDetails(id: string) {
    this.router.navigate(['/recipe-details', id]);
  }

}
