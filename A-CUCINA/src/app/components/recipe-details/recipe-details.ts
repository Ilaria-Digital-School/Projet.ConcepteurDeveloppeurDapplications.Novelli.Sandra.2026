import { Component, inject } from '@angular/core';
import { RecipeService } from '../../services/recipe-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-recipe-details',
  imports: [],
  templateUrl: './recipe-details.html',
  styleUrl: './recipe-details.css',
})
export class RecipeDetails {

  recipes: any[] = [];
  recipe: any = {};
  recipeId!: string;

  private activatedRoute = inject(ActivatedRoute);
  private recipeService = inject(RecipeService)

  // ngOnInit() {


  //   this.recipeId = this.activatedRoute.snapshot.paramMap.get('id') || '';
  //   console.log(this.recipeId);

  //   this.recipeService.getRecipeById(this.recipeId).subscribe({
  //     next: (res: any) => {
  //       this.recipe = res;
  //       console.log(this.recipe);
  //     },
  //     error: (err) => {
  //       console.log(err);
  //       alert('Error loading recipe');
  //     }

  //   })
  // }

  ngOnInit(){
  this.activatedRoute.paramMap.subscribe(params => {
    this.recipeId = params.get('id') || '';

    if (this.recipeId) {
      this.recipeService.getRecipeById(this.recipeId).subscribe({
        next: (res: any) => {
          console.log('Recipe:', res);
          this.recipe = res;
        },
        error: (err: any) => {
          console.error(err);
        }
      });
    }
  });
}

}
