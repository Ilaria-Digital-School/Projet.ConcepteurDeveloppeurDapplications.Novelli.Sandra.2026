import { Component, computed, inject, signal } from '@angular/core';
import { RecipeService } from '../../services/recipe-service';
import { Router } from '@angular/router';
import { Subject, map } from 'rxjs';
import { FavouriteService } from '../../services/favourite-service';
import { FilterService } from '../../services/filter-service';

@Component({
  selector: 'app-recipes',
  imports: [],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css',
})
export class Recipes {

  // recipeID!: string;
  // recipe: any = {};
  recipes = signal<any[]>([]);
  searchValue = signal('');

  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private filterService = inject(FilterService);
  public favouriteService = inject(FavouriteService);


  ngOnInit() {
    this.loadRecipes();
  }


  filteredRecipes = computed(() => {
    const category = this.filterService.selectedCategory();
    const search = this.searchValue().toLowerCase().trim();

    return this.recipes().filter(recipe =>
      (category === null || recipe.categories?.includes(category)) &&
      recipe.name.toLowerCase().includes(search)
    );
  });


  viewRecipeDetails(id: string) {
    this.router.navigate(['/recipe-details', id]);
  }

  loadRecipes() {
    // Subscribe method is mandatory to fetch data.
    this.recipeService.getAllRecipes().subscribe({
      next: (res: any) => {
        this.recipes.set(res);
        console.log('Reponse?');
        console.log(res);
      },
      error: (err) => {
        console.log(err);
        alert('Failed to get recipe list');
      }
    });
  }

  faveOrUnfave(recipeObj: any) {
    this.favouriteService.toggleFavourite(recipeObj);
  }

}
